module.exports = function (grunt) {
  'use strict'

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    eslint: {
      src: ['**/*.js', '!node_modules/**/*.js', 'Gruntfile.js', 'test/**/*.js'],
      options: {
        ignorePattern: 'node_modules/*'
      }
    }
  })

  require('load-grunt-tasks')(grunt)

  grunt.registerTask('default', 'eslint')
}
