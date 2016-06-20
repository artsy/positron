_ = require 'underscore'
Articles = require '../../collections/articles.coffee'

@articles = (req, res, next) ->
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
      console.log articles.length
      res.render 'index',
        articles: articles
        published: published
        page: page or 1
        totalPages: Math.ceil(articles.count / size)