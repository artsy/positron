Article = require '../../models/article'
{ spooky } = require '../../lib/apis'

@create = (req, res, next) ->
  render res, new Article

@edit = (req, res, next) ->
  spooky.get Article, 'article', params: { id: req.params.id }, (err, article) ->
    return next err if err
    render res, article

render = (res, article) ->
  res.locals.sd.ARTICLE = article.toJSON()
  res.render 'index', article: article