#
# Client-side Ezel app mounted to the main server.
#
require('regenerator-runtime/runtime')

setup = require "./lib/setup"
express = require "express"

app = module.exports = express()
setup app
