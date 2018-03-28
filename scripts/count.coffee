require('node-env-file')(require('path').resolve __dirname, '../.env')
mongojs = require 'mongojs'
path = require 'path'
Article = require '../src/api/apps/articles/model/index.js'
env = require 'node-env-file'

# Connect to database
db = mongojs(process.env.MONGOHQ_URL, ['articles'])

db.articles.find(indexable: true).count (err, count) ->
  console.log(count)
  process.exit()
