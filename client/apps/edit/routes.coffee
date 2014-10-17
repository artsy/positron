Article = require '../../models/article'

@create = (req, res, next) ->
  render res, new Article

@edit = (req, res, next) ->
  new Article(id: req.params.id).fetch
    headers: 'x-access-token': req.user.get('access_token')
    error: res.backboneError
    success: (article) ->render res, article

render = (res, article) ->
  res.locals.sd.ARTICLE = article.toJSON()
  res.render 'index', article: article