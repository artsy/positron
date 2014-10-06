_ = require 'underscore'
Articles = require '../../collections/articles.coffee'

@articles = (req, res, next) ->
  new Articles().fetch
    data: _.extend(
      { offset: (req.query.page or 0) * 5 }
      { author_id: req.user.get('id') }
    )
    headers: 'x-access-token': req.user.get('access_token')
    error: res.backboneError
    success: (articles) ->
      res.render 'index',
        articles: articles.models
        published: req.query.published is 'true'
        page: req.query.page or 0
        totalPages: Math.round(articles.count / 5)