function findPartials (template) {
  var allIncludes = template.match(/{[\s+]?(include)[^}]*}/g)
  var allExtends = template.match(/{[\s+]?(extends)[^}]*}/g)
  var allPartials = []
  var actualIncludes = []
  var t
  var p
  var k
  var i
  var params = []
  if (allIncludes && allIncludes.length > 0) {
    for (i = 0; i < allIncludes.length; i++) {
      t = allIncludes[i].match(/{[\s+]?include(.*)}/)
      if (t && t[1]) {
        p = t[1]
        allPartials.push(p)
      }
    }
  }

  if (allExtends && allExtends.length > 0) {
    for (i = 0; i < allExtends.length; i++) {
      t = allExtends[i].match(/{[\s+]?extends(.*)}/)
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
