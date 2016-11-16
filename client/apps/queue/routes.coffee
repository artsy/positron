_ = require 'underscore'
Articles = require '../../collections/articles.coffee'
positronql = require '../../lib/positronql.coffee'
query = require './query.coffee'

@queue = (req, res, next) ->
  tab = req.query.tab or 'daily'
  size = 5
  published = true
  channel_id = req.user?.get('current_channel').id

  positronql
    query: query(published, channel_id)
    req: req
  .then (result) =>
    if result.error
      return res.backboneError

    res.render 'index',
      articles: new Articles result.articles
      published: true
      current_channel: req.user?.get('current_channel')
