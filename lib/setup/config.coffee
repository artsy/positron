#
# Loads the .env file and injects into sharify to share config on the client.
#

{ resolve } = require 'path'
env = require 'node-env-file'
switch process.env.NODE_ENV
  when 'test' then env resolve __dirname, '../../.env.test'
  else env resolve __dirname, '../../.env'
sharify = require 'sharify'

sharify.data =
  APP_URL: process.env.APP_URL
  NODE_ENV: process.env.NODE_ENV
  SPOOKY_URL: process.env.SPOOKY_URL
  FORCE_URL: process.env.FORCE_URL
  ARTSY_URL: process.env.ARTSY_URL
  # TODO: This is a sensitive Spooky App token and we'll want to hide this
  # on the server. Potential solution involves adding the token on the
  # Positron-server-side and proxying to Spooky—then maybe having Positron
  # do user-level-auth (with Gravity?). Or adding user-level auth to Spooky.
  SPOOKY_TOKEN: process.env.SPOOKY_TOKEN