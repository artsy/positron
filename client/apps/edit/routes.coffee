Article = require '../../models/article'

@create = (req, res, next) ->
  render res, new Article

@edit = (req, res, next) ->
  new Article(id: req.params.id).fetch
    headers: 'x-access-token': req.user.get('access_token')
    error: res.backboneError
    success: (article) ->
      console.log article.get('author_id'), req.user.get('id')
      if article.get('author_id') isnt req.user.get('id')
        res.redirect "/impersonate/#{article.get 'author_id'}?redirect-to=#{req.url}"
      else
        render res, article

render = (res, article) ->
  res.locals.sd.ARTICLE = article.toJSON()
  res.render 'layout/index', article: article
