#
# Wraps & exports a mongodb instance. Automatically selects collections based
# on the folder names under /apps. https://github.com/mafintosh/mongojs
#

mongo = require 'mongodb'
fs = require 'fs'
path = require 'path'
{ MONGOHQ_URL } = process.env
debug = require('debug') 'api'

collections = ['articles', 'users', 'sections', 'artists', 'curations', 'channels', 'tags', 'verticals', 'authors', 'sessions']

MongoClient = mongo.MongoClient

MongoClient.connect MONGOHQ_URL, (err, db) ->
  exit = (msg) -> (err) ->
    debug msg
    debug msg, err if msg is 'Mongo Error'
    process.exit(1)
  
  collections = db.Collections(collections)

  db.on 'close', exit('Mongo Connection Closed')
  db.on 'error', exit('Mongo Error')

  collections.createCollection('sessions', {})

module.exports = db
module.exports.collections = collections
