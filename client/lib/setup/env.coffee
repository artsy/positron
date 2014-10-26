#
# Sets the app up for enviornment-specific configurations
#

path = require 'path'
sd = require('sharify').data
{ NODE_ENV } = process.env

module.exports = (app) ->

  # Development only
  if NODE_ENV in ['development', 'test']
    # Compile assets on request in development
    app.use require('stylus').middleware
      src: path.resolve(__dirname, '../../')
      dest: path.resolve(__dirname, '../../public')
    app.use require('browserify-dev-middleware')
      src: path.resolve(__dirname, '../../')
      transforms: [require('caching-coffeeify'), require('jadeify')]
      globalTransforms: [require('deamdify')]

  # Test only
  if 'test' is NODE_ENV
    app.use '/__gravity', require('antigravity').server
