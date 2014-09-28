#
# Sets the app up for enviornment-specific configurations
#

path = require 'path'
sd = require('sharify').data

module.exports = (app) ->

  # Development only
  if 'development' is sd.NODE_ENV
    # Compile assets on request in development
    app.use require('stylus').middleware
      src: path.resolve(__dirname, '../../')
      dest: path.resolve(__dirname, '../../public')
    app.use require('browserify-dev-middleware')
      src: path.resolve(__dirname, '../../')
      transforms: [require('jadeify'), require('caching-coffeeify')]

  # Test only
  if 'test' is sd.NODE_ENV
    app.use '/__spooky', require('../../test/helpers/integration.coffee').spooky
    app.use '/__gravity', require('../../test/helpers/integration.coffee').gravity