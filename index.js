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

function handleFileSync (name, file) {
  var fileData = loadFileSync(file)
  var partials = findPartials(fileData)
  return {
    name: name,
    data: fileData,
    partials: partials
  }
}

function handleFile (name, file, callback) {
  loadFile(file, function (err, fileData) {
    if (err) {
      return callback(err)
    }

    var partials = findPartials(fileData)
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

function loadAllPartialsSync (unparsedPartials) {
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
    var partialData = handleFileSync(partial, fullFilePath)
    partials[partialData.name] = partialData.data
    var consolidatedPartials = consolidatePartials([partialData])
    var partialsToLoad = findUnloadedPartials(consolidatedPartials, partials)
    if (partialsToLoad) {
      unparsedPartials = unparsedPartials.concat(partialsToLoad)
    }
  }
  return partials
}

function loadAllPartials (unparsedPartials, partials, callback) {
  if (!partials) {
    partials = {}
  }
  if (unparsedPartials.length === 0) {
    return callback(null, partials)
  }
  async.map(unparsedPartials, function (partial, next) {
    var fullFilePath = path.resolve(partial)
    return handleFile(partial, fullFilePath, next)
  }, function (err, data) {
    if (err) {
      return callback(err)
    }
    data.forEach(function (partialData) {
      partials[partialData.name] = partialData.data
    })

    var consolidatedPartials = consolidatePartials(data)
    var partialsToLoad = findUnloadedPartials(consolidatedPartials, partials)
    return loadAllPartials(partialsToLoad, partials, callback)
  })
}

function entry (source) {
  var query = loaderUtils.getOptions(this) || {}

  if (this.cacheable) {
    this.cacheable()
  }

  var partialsList = findPartials(source)
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

      var dataToSend = 'var smarty = require("jsmart");\n' +
        '\n' + partialStr + '\n' +
          'module.exports = function() { ' +
            'var comp = new smarty(' + JSON.stringify(source) + ');\n' +
              'return comp.fetch.apply(comp, arguments); };'

      callback(null, dataToSend)
    })
  } else {
    var partialsData = loadAllPartialsSync(partialsList)

    partialStr += 'smarty.prototype.getTemplate = function (name) {\n'
    for (var name in partialsData) {
      if (partialsData.hasOwnProperty(name)) {
        partialStr += 'if (name == "' + name + '") { return ' + JSON.stringify(partialsData[name]) + '; }\n'
      }
    }
    partialStr += '  };'

    return 'var smarty = require("jsmart");\n' +
      '\n' + partialStr + '\n' +
        'module.exports = function() { ' +
          'var comp = new smarty(' + JSON.stringify(source) + ');\n' +
            'return comp.fetch.apply(comp, arguments); };'
  }
}

module.exports = entry
