require('node-env-file')(require('path').resolve __dirname, '../.env')
{ MongoClient } = require 'mongodb'
path = require 'path'
{ indexForSearch } = Save = require '../src/api/apps/articles/model/distribute'
Article = require '../src/api/apps/articles/model/index.js'
ArticleModel = require '../src/api/models/article.coffee'
search = require '../src/api/lib/elasticsearch'
async = require 'async'
{ cloneDeep } = require 'lodash'

# Setup environment variables
env = require 'node-env-file'
switch process.env.NODE_ENV
  when 'test' then env path.resolve __dirname, '../.env.test'
  when 'production', 'staging' then ''
  else env path.resolve __dirname, '../.env'

# Connect to database
client = new MongoClient(process.env.MONGOHQ_URL)
await client.connect()
db = await client.db()
articles = await db.collection('articles')

articles.find({}).toArray (err, articles) ->
  console.log(err) if err
  console.log(articles.length)
  async.mapSeries(articles, indexWorker, (err, results) =>
    console.log('Completed indexing ' + results.length + ' articles.')
  )

indexWorker = (article, cb) ->
  console.log('indexing ', article._id)
  articlePresent = Article.present(article)
  indexForSearch articlePresent, () =>
    console.log('indexed on Elasticsearch ', article.id or article._id)
    cb()
