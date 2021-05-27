'use strict'

var fs = require('fs')
var should = require('should')
var jsmartLoader = require('../index')

describe('jsmartLoader', function () {
  it('Basic run', function (done) {
    fs.readFile('test/test01/index.html', 'utf8', function (err, data) {
      try {
        if (err) {
          done(err)
          return
        }
        var results = jsmartLoader.apply({query: {}}, [data])
        var module = {}
        eval(results) // eslint-disable-line no-eval
        should.exist(module.exports)
        module.exports.should.be.type('function')

        var templateResults = module.exports({a: 5})

        templateResults.should.eql('<div>5</div>\n')
        done()
      } catch (e) {
        done(e)
      }
    })
  })

  it('Run with partial', function (done) {
    fs.readFile('test/test02/index.html', 'utf8', function (err, data) {
      try {
        if (err) {
          done(err)
          return
        }
        var results = jsmartLoader.apply({query: {}}, [data])
        var module = {}
        eval(results) // eslint-disable-line no-eval
        should.exist(module.exports)
        module.exports.should.be.type('function')

        var templateResults = module.exports({a: 5})

        templateResults.should.eql('Hello\n5 thats the number\n')
        done()
      } catch (e) {
        done(e)
      }
    })
  })
})
