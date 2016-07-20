_ = require 'underscore'
Articles = require '../../collections/articles.coffee'

@articles = (req, res, next) ->
  console.log 'in the articles thing'
  page = parseInt req.query.page
  size = 10
  new Articles().fetch
    data:
      offset: if page then (page - 1) * size else 0
      limit: size
      channel_id: req.user?.get('current_channel').id
      published: published = req.query.published is 'true'
    headers: 'x-access-token': req.user?.get('access_token')
    error: res.backboneError
    success: (articles) ->
      res.render 'index',
        articles: articles
        published: published
        page: page or 1
        totalPages: Math.ceil(articles.count / size)
        current_channel: req.user?.get('current_channel')