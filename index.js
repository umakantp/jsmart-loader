'use strict'

var async = require('async')
var loaderUtils = require('loader-utils')
var findPartials = require('./find-partials')
var path = require('path')
var fs = require('fs')

function consolidatePartials (arr) {
  var partialsSet = {}
  arr.forEach(function (item) {
    item.partials.forEach(function (partial) {
      partialsSet[partial] = true
    })
  })
  return Object.keys(partialsSet)
}

// Load a single file, and return the data.
function loadFile (fullFilePath, callback) {
  fs.readFile(fullFilePath, 'utf-8', function (err, data) {
    if (err) {
      return callback(err)
    }

    return callback(null, data)
  })
}

function loadFileSync (fullFilePath, callback) {
  return fs.readFileSync(fullFilePath, 'utf-8')
}

function handleFileSync (name, file, leftDelim, rightDelim, autoLiteral) {
  var fileData = loadFileSync(file)
  var partials = findPartials(fileData, leftDelim, rightDelim, autoLiteral)
  return {
    name: name,
    data: fileData,
    partials: partials
  }
}

function handleFile (name, file, callback, leftDelim, rightDelim, autoLiteral) {
  loadFile(file, function (err, fileData) {
    if (err) {
      return callback(err)
    }

    var partials = findPartials(fileData, leftDelim, rightDelim, autoLiteral)
    var data = {
      name: name,
      data: fileData,
      partials: partials
    }
    return callback(null, data)
  })
}

// Of the partials given, which haven't been loaded yet?
function findUnloadedPartials (partialNames, loadedPartials) {
  return partialNames.filter(function (partialName) {
    return !(partialName in loadedPartials)
  })
}

function loadAllPartialsSync (unparsedPartials, leftDelim, rightDelim, autoLiteral) {
  var partials = {}
  if (unparsedPartials.length === 0) {
    return partials
  }
  var partial
  while (true) {
    partial = unparsedPartials.shift()
    if (!partial) {
      break
    }
    var fullFilePath = path.resolve(partial)
    var partialData = handleFileSync(partial, fullFilePath, leftDelim, rightDelim, autoLiteral)
    partials[partialData.name] = partialData.data
    var consolidatedPartials = consolidatePartials([partialData])
    var partialsToLoad = findUnloadedPartials(consolidatedPartials, partials)
    if (partialsToLoad) {
      unparsedPartials = unparsedPartials.concat(partialsToLoad)
    }
  }
  return partials
}

function loadAllPartials (unparsedPartials, partials, callback, leftDelim, rightDelim, autoLiteral) {
  if (!partials) {
    partials = {}
  }
  if (unparsedPartials.length === 0) {
    return callback(null, partials)
  }
  async.map(unparsedPartials, function (partial, next) {
    var fullFilePath = path.resolve(partial)
    return handleFile(partial, fullFilePath, next, leftDelim, rightDelim, autoLiteral)
  }, function (err, data) {
    if (err) {
      return callback(err)
    }
    data.forEach(function (partialData) {
      partials[partialData.name] = partialData.data
    })

    var consolidatedPartials = consolidatePartials(data)
    var partialsToLoad = findUnloadedPartials(consolidatedPartials, partials)
    return loadAllPartials(partialsToLoad, partials, callback, leftDelim, rightDelim, autoLiteral)
  })
}

function entry (source) {
  var query = loaderUtils.getOptions(this) || {}
  var leftDelim = '{'
  var rightDelim = '}'
  var autoLiteral = true

  if (this.cacheable) {
    this.cacheable()
  }

  if (query.leftDelim) {
    leftDelim = query.leftDelim
  }

  if (query.rightDelim) {
    leftDelim = query.rightDelim
  }

  if (typeof query.autoLiteral !== 'undefined') {
    autoLiteral = query.autoLiteral
  }

  var partialsList = findPartials(source, leftDelim, rightDelim, autoLiteral)
  var partialStr = ''

  if (this.async && query.async) {
    var callback = this.async()

    loadAllPartials(partialsList, null, function (err, partialsData) {
      if (err) {
        return callback(err)
      }
      partialStr += 'smarty.prototype.getTemplate = function (name) {\n'
      for (var name in partialsData) {
        if (partialsData.hasOwnProperty(name)) {
          partialStr += 'if (name == "' + name + '") { return ' + JSON.stringify(partialsData[name]) + '; }\n'
        }
      }
      partialStr += '  };'

      var dataToSend = buildOutput(partialStr, source, leftDelim, rightDelim, autoLiteral)

      callback(null, dataToSend)
    }, leftDelim, rightDelim, autoLiteral)
  } else {
    var partialsData = loadAllPartialsSync(partialsList, leftDelim, rightDelim, autoLiteral)

    partialStr += 'smarty.prototype.getTemplate = function (name) {\n'
    for (var name in partialsData) {
      if (partialsData.hasOwnProperty(name)) {
        partialStr += 'if (name == "' + name + '") { return ' + JSON.stringify(partialsData[name]) + '; }\n'
      }
    }
    partialStr += '  };'

    return buildOutput(partialStr, source, leftDelim, rightDelim, autoLiteral)
  }
}

function buildOutput (partial, source, leftDelim, rightDelim, autoLiteral) {
  var secondOptions = []
  var t = 'var smarty = require("jsmart");\n' +
    '\n' + partial + '\n' +
      'module.exports = function() { '

  if (leftDelim) {
    secondOptions.push('ldelim: \'' + leftDelim + '\'')
  }
  if (rightDelim) {
    secondOptions.push('rdelim: \'' + rightDelim + '\'')
  }
  if (typeof autoLiteral !== 'undefined') {
    if (autoLiteral) {
      autoLiteral = 'true'
    } else {
      autoLiteral = 'false'
    }
    secondOptions.push('autoLiteral: ' + autoLiteral)
  }
  var secondOptionsData = ''
  if (secondOptions.length) {
    secondOptionsData = ', {' + secondOptions.join(',') + '}'
  }

  t += 'var comp = new smarty(' + JSON.stringify(source) + secondOptionsData + ');\n' +
    'return comp.fetch.apply(comp, arguments); };'
  return t
}

module.exports = entry
