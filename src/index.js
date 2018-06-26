require('regenerator-runtime/runtime')
require('coffeescript/register')
require('@babel/register')({
  extensions: ['.mjs', '.ts', '.js', '.tsx', '.jsx']
})

require('./boot')
