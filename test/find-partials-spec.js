'use strict'

var findPartials = require('../find-partials')
require('should')

function sort (arr) {
  var copy = arr.slice()
  copy.sort()
  return copy
}

describe('findPartials', function () {
  it('should find a single partial', function () {
    var results = findPartials("{include file='test'}")
    sort(results).should.eql(['test'])
  })

  it('should find multiple partials', function () {
    var results = findPartials("{include 'test1'} {include file='test2'}")
    sort(results).should.eql(['test1', 'test2'])
  })

  it('should find partials with spaces around', function () {
    var results = findPartials('{ include file="test3" }')
    sort(results).should.eql(['test3'])
  })

  it('should only return a partial once', function () {
    var results = findPartials("{include file='test4'} {include 'test5'}")
    sort(results).should.eql(['test4', 'test5'])
  })

  it('should only return partial no other params', function () {
    var results = findPartials("{include file='test6' nocache} {include 'test7' test}")
    sort(results).should.eql(['test6', 'test7'])
  })
})
