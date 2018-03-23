require('babel-core/register')
require('node-env-file')(require('path').resolve __dirname, '../.env')
mongojs = require 'mongojs'
path = require 'path'
{ indexForSearch } = Save = require '../src/api/apps/articles/model/distribute'
Article = require '../src/api/apps/articles/model/index.js'
search = require '../src/api/lib/elasticsearch'
async = require 'async'

# Setup environment variables
env = require 'node-env-file'
switch process.env.NODE_ENV
  when 'test' then env path.resolve __dirname, '../.env.test'
  when 'production', 'staging' then ''
  else env path.resolve __dirname, '../.env'

# Connect to database
db = mongojs(process.env.MONGOHQ_URL, ['articles'])

db.articles.find({}).toArray (err, articles) ->
  console.log(err) if err
  console.log(articles.length)
  async.mapSeries(articles, indexWorker, (err, results) =>
    console.log('Completed indexing ' + results.length + 'articles.')
  )

indexWorker = (article, cb) ->
  console.log('indexing ' + article._id)
  indexForSearch Article.present(article), () =>
    console.log('indexed ' + article.id or article._id)
    cb()
