
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

var code = '(function($, exports){\n'

files.forEach(function(file) {
  file = path.resolve('src', file + '.js')
  try {
    require(file)
  } catch(e) {}
  code += fs.readFileSync(file).toString()
})

code += "\n}(Yocto, typeof module !== 'undefined' && module.exports || (window['dateui'] = {})))"

fs.writeFileSync('dateui.js', code)
