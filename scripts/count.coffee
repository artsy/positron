require('node-env-file')(require('path').resolve __dirname, '../.env')
{ MongoClient } = require 'mongodb'
path = require 'path'
Article = require '../src/api/apps/articles/model/index.js'
env = require 'node-env-file'

# Connect to database
client = new MongoClient(process.env.MONGOHQ_URL)
await client.connect()
db = await client.db()
articles = await db.collection('articles')

articles.find(indexable: true).count (err, count) ->
  console.log(count)
  process.exit()
