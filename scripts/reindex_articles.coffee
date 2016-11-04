require('node-env-file')(require('path').resolve __dirname, '../.env')
mongojs = require 'mongojs'
path = require 'path'
{ indexForSearch } = Save = require '../api/apps/articles/model/save'
Article = require '../api/apps/articles/model/index'
search = require '../api/lib/elasticsearch'

# Setup environment variables
env = require 'node-env-file'
switch process.env.NODE_ENV
  when 'test' then env path.resolve __dirname, '../.env.test'
  when 'production', 'staging' then ''
  else env path.resolve __dirname, '../.env'

# Connect to database
db = mongojs(process.env.MONGOHQ_URL, ['articles'])

db.articles.find({ }).toArray (err, articles) ->
  console.log(err) if err
  indexWorker(articles, 0)

indexWorker = (articles, i) ->
  a = articles[i]
  console.log('indexing ' + a._id)
  indexForSearch Article.present(a)
  setTimeout( =>
    console.log('indexed ' + a.id or a._id)
    indexWorker(articles, ++i)
  , 50)
