#
# Wraps & exports a mongojs instance. Automatically selects collections based
# on the folder names under /apps. https://github.com/mafintosh/mongojs
#

mongojs = require 'mongojs'
fs = require 'fs'
path = require 'path'
{ MONGOHQ_URL } = process.env
debug = require('debug') 'api'

collections = ['articles', 'users', 'sections', 'artists']
db = mongojs MONGOHQ_URL, collections
db.on 'close', ->
  debug 'Mongo Connection Closed'
  process.exit(1)

module.exports = db
module.exports.collections = collections
