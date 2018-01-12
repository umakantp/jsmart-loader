function findPartials (template, leftDelim, rightDelim) {
  var includesRegex = new RegExp(leftDelim + '[\\s+]?(include)[^' + rightDelim[0] + ']*' + rightDelim, 'g')
  var extendsRegex = new RegExp(leftDelim + '[\\s+]?(extends)[^' + rightDelim[0] + ']*' + rightDelim, 'g')
  var includeSpecRegex = new RegExp(leftDelim + '[\\s+]?include(.*)' + rightDelim)
  var extendsSpecRegex = new RegExp(leftDelim + '[\\s+]?extends(.*)' + rightDelim)
  var allIncludes = template.match(includesRegex)
  var allExtends = template.match(extendsRegex)
  var allPartials = []
  var actualIncludes = []
  var t
  var p
  var k
  var i
  var params = []
  if (allIncludes && allIncludes.length > 0) {
    for (i = 0; i < allIncludes.length; i++) {
      t = allIncludes[i].match(includeSpecRegex)
      if (t && t[1]) {
        p = t[1]
        allPartials.push(p)
      }
    }
  }

  if (allExtends && allExtends.length > 0) {
    for (i = 0; i < allExtends.length; i++) {
      t = allExtends[i].match(extendsSpecRegex)
      if (t && t[1]) {
        p = t[1]
        allPartials.push(p)
      }
    }
  }

  if (allPartials && allPartials.length > 0) {
    for (i = 0; i < allPartials.length; i++) {
      params = allPartials[i].match(/file=(.*)/)

      if (params) {
        k = params[1].trim().match(/['"](.*)['"]/)
      } else {
        k = allPartials[i].trim().match(/['"](.*)['"]/)
      }
      if (k) {
        // If string has quotes.
        actualIncludes.push(k[1].trim().replace(/^['"](.*)['"]$/, '$1'))
      }
    }
  }
  return actualIncludes
}

module.exports = findPartials
