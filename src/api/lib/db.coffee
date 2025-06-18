{ MongoClient } = require 'mongodb-legacy'
fs = require 'fs'
path = require 'path'
{ MONGOHQ_URL } = process.env
debug = require('debug') 'api'

client = new MongoClient(MONGOHQ_URL)
client.connect()

db = client.db()

exit = (msg) -> (err) ->
  debug msg
  debug msg, err if msg is 'Mongo Error'
  process.exit(1)

client.on 'close', exit('Mongo Connection Closed')
client.on 'error', exit('Mongo Error')

module.exports = db
