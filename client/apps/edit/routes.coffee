Article = require '../../models/article'
User = require '../../models/user'
Channel = require '../../models/channel'

@create = (req, res, next) ->
  res.locals.sd.IS_EDITORIAL_TEAM = req.user.isEditorialTeam()
  render req, res, new Article

@edit = (req, res, next) ->
  new Article(id: req.params.id).fetch
    headers: 'x-access-token': req.user.get('access_token')
    error: res.backboneError
    success: (article) ->
      res.locals.sd.ACCESS_TOKEN = req.user.get('access_token')
      res.locals.sd.IS_EDITORIAL_TEAM = req.user.isEditorialTeam()
      res.locals.sd.CURRENT_CHANNEL = new Channel req.user.get('current_channel')
      render req, res, article

render = (req, res, article) ->
  res.locals.sd.ARTICLE = article.toJSON()
  view = if res.locals.sd.IS_MOBILE then 'mobile/index' else 'layout/index'
  res.render view, article: article
