require('@babel/register')({
  extensions: ['.ts', '.js', '.tsx', '.jsx']
})
require('coffeescript/register')
require('./boot')
