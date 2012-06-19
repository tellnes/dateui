
var fs = require('fs')
  , path = require('path')

var files = [ 'events'
            , 'util'
            , 'options'
            , 'i18n'
            , 'picker'
            , 'yocto'
            , 'exports'
            ]

var pkg = require('./package.json')

var code =  [ '/*'
            , ' * DateUI ' + pkg.version
            , ' *'
            , ' * Copyright (c) 2012 Christian Tellnes <christian@tellnes.no>'
            , ' * Licensed under the MIT licence.'
            , ' *'
            , ' * Date: ' + new Date()
            , ' */'
            , ''
            , '(function($, exports){'
            , ''
            ].join('\n')

files.forEach(function(file) {
  file = path.resolve('src', file + '.js')
  try {
    require(file)
  } catch(e) {}
  code += fs.readFileSync(file).toString()
})

code += "\n}(Yocto, typeof module !== 'undefined' && module.exports || (window['dateui'] = {})))"

fs.writeFileSync('dateui.js', code)
