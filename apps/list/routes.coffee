Articles = require '../../collections/articles.coffee'
Article = require '../../models/article.coffee'

@index = (req, res) ->
  new Articles().fetch
    error: res.backboneError
    success: (articles) ->
      res.locals.sd.ARTICLES = articles.toJSON()
      res.render 'index', articles: articles.models