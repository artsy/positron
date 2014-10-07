#
# Client-side Ezel app mounted to the main server.
#

setup = require "./lib/setup"
express = require "express"

app = module.exports = express()
setup app