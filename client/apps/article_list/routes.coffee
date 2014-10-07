_ = require 'underscore'
Articles = require '../../collections/articles.coffee'

@articles = (req, res, next) ->
  new Articles().fetch
    data: _.extend(req.query, author_id: req.user.get('id'))
    headers: 'x-access-token': req.user.get('access_token')
    error: (m, e) -> next e
    success: (articles) ->
      res.render 'index',
        articles: articles.models
        published: req.query.published is 'true'