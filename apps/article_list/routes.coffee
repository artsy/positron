_ = require 'underscore'
Articles = require '../../collections/articles.coffee'
{ spooky } = require '../../lib/apis'

@articles = (req, res, next) ->
  if (page = parseInt(req.query.page)) > 0
    query = "articles.#{_.times(page, -> 'next').join('.')}.articles"
  else
    query = 'articles.articles'
  state = req.query.state or 1
  spooky.new Articles, query, params: { state: state }, (err, articles) ->
    return next err if err
    res.render 'index', articles: articles.models, state: state