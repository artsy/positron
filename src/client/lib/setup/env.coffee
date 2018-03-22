#
# Sets the app up for enviornment-specific configurations
#

path = require 'path'
sd = require('sharify').data
{ NODE_ENV } = process.env

module.exports = (app) ->
  if 'development' is NODE_ENV

    # Compile assets on request in development
    app.use require('stylus').middleware
      src: path.resolve(__dirname, '../../')
      dest: path.resolve(__dirname, '../../public')

  # Mount antigravity in test
  if 'test' is NODE_ENV
    app.use '/__gravity', require('antigravity').server
