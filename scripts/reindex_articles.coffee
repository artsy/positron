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
  articles.map (a) ->
    indexForSearch Article.present(a), (opts) ->
      console.log('indexed ' + a.id or a._id)
