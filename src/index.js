require('coffeescript/register')
require('@babel/register')({
  extensions: ['.ts', '.js', '.tsx', '.jsx']
})

require('./boot')
