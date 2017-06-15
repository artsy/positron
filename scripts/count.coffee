require('node-env-file')(require('path').resolve __dirname, '../.env')
mongojs = require 'mongojs'
path = require 'path'
Article = require '../api/apps/articles/model/index'
env = require 'node-env-file'

# Connect to database
db = mongojs(process.env.MONGOHQ_URL, ['articles'])

db.articles.find(indexable: true).toArray (err, articles) ->
    console.log(articles.length)
    #console.log(article.thumbnail_image) for article in articles
