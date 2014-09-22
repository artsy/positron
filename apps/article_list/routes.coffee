_ = require 'underscore'
Articles = require '../../collections/articles.coffee'
spooky = require '../../lib/spooky_fetcher'

@published = (req, res, next) ->
  if (page = parseInt(req.query.page)) > 0
    query = "articles.#{_.times(page, -> 'next').join('.')}.articles"
  else
    query = 'articles.articles'
  spooky.new Articles, query, (err, articles) ->
    return next err if err
    res.locals.sd.ARTICLES = articles.toJSON()
    res.render 'index', articles: articles.models