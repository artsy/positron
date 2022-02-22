#
# Wraps & exports a mongojs instance. Automatically selects collections based
# on the folder names under /apps. https://github.com/mafintosh/mongojs
#

mongojs = require 'mongodb'
fs = require 'fs'
path = require 'path'
{ MONGOHQ_URL } = process.env
debug = require('debug') 'api'

collections = ['articles', 'users', 'sections', 'artists', 'curations', 'channels', 'tags', 'verticals', 'authors', 'sessions']
#db = mongojs MONGOHQ_URL, collections
db = new mongojs.Db MONGOHQ_URL, collections
console.info(db.listDatabases())

exit = (msg) -> (err) ->
  debug msg
  debug msg, err if msg is 'Mongo Error'
  process.exit(1)

module.exports = db
module.exports.collections = collections
