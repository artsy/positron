require('node-env-file')(require('path').resolve __dirname, '../.env')
MongoClient = require 'mongodb'. MongoClient
path = require 'path'
Article = require '../src/api/apps/articles/model/index.js'
env = require 'node-env-file'

MongoClient.connect process.env.MONGOHQ_URL, (connerr, db) ->
  if connerr
    console.log connerr
  else
    collection = db.collection('articles')
    collection.find(indexable: true).count (err, count) ->
      console.log(count)
      process.exit()


