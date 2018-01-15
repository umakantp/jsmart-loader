# jSmart loader for webpack
jSmart loader lets you use [jSmart(Smarty template javascript engine)](https://github.com/umakantp/jsmart) and Webpack together, including auto-loading partials.

[![Build Status](https://travis-ci.org/umakantp/jsmart-loader.png?branch=master)](https://travis-ci.org/umakantp/jsmart-loader)
[![npm version](https://img.shields.io/npm/v/jsmart-loader.svg)](https://www.npmjs.com/package/jsmart-loader)
[![David](https://img.shields.io/david/umakantp/jsmart-loader.svg)](https://www.npmjs.com/package/jsmart-loader)
[![David](https://img.shields.io/david/dev/umakantp/jsmart-loader.svg)](https://www.npmjs.com/package/jsmart-loader)
[![npm](https://img.shields.io/npm/l/jsmart-loader.svg)](https://github.com/umakantp/jsmart-loader/blob/master/LICENSE)

## Install

```sh
npm install jsmart-loader --save-dev
```

## Usage


#### webpack 2.x and webpack 3.x
```javascript
module: {
    rules: [ {
        test: /\.tpl|\.smarty$/,
        loader: 'jsmart-loader'
    } ]
}
```
#### webpack 1.x
```javascript
module: {
    loaders: [ {
        test: /\.tpl|\.smarty$/,
        loader: 'jsmart'
    } ]
}
```

```javascript
var template = require('./template.smarty');
var html = template({ name: 'world' });
```

If you want to set custom delimiters then you can pass on delimiters one (left or right) or both using options. You can also pass on auto delimiters detection on or off using options.

```javascript
module: {
  rules: [ {
    test: /template\.smarty$/,
    loader: 'jsmart-loader',
    options: {
      leftDelim: '{{',
      rightDelim: '}}',
      autoLiteral: false
    },
  } ]
}
```

[Documentation: Using loaders](https://webpack.js.org/concepts/loaders/#using-loaders).
