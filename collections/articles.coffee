sd = require('sharify').data
SpookyCollection = require './spooky.coffee'
Article = require '../models/article.coffee'

module.exports = class Articles extends SpookyCollection
  model: Article
  modelName: 'article'
  url: "#{sd.SPOOKY_URL}/api/articles"