Article = require '../../models/article.coffee'
User = require '../../models/user'
Channel = require '../../models/channel'
sd = require('sharify').data
{ getSessionsForChannel } = require '../websocket'

@create = (req, res, next) ->
  channel = new Channel req.user.get('current_channel')
  res.locals.sd.CURRENT_CHANNEL = channel
  article = new Article {
    channel_id: channel.get('id') if channel.get('type') isnt 'partner'
    partner_channel_id: channel.get('id') if channel.get('type') is 'partner'
    partner_ids: [channel.get('id')] if channel.get('type') is 'partner'
    author: { name: channel.get('name'), id: req.user.get('id') }
    layout: req.query.layout or 'classic'
  }
  setChannelIndexable channel, article
  render req, res, article

@edit = (req, res, next) ->
  new Article(id: req.params.id).fetch
    headers: 'x-access-token': req.user.get('access_token')
    error: res.backboneError
    success: (article) ->
      return next() unless req.user.hasArticleAccess article
      res.locals.sd.ACCESS_TOKEN = req.user.get('access_token')
      channel = new Channel req.user.get('current_channel')
      res.locals.sd.CURRENT_CHANNEL = channel

      # TODO: Remove after text2
      url = req.originalUrl.split('/').pop()
      isEdit2 = url is "edit2"
      isEditorial = channel.get("type") is "editorial"
      if isEdit2 and isEditorial
        res.locals.sd.IS_EDIT_2 = true
      else
        res.locals.sd.IS_EDIT_2 = false

      if (article.get('channel_id') or article.get('partner_channel_id')) isnt req.user.get('current_channel').id
        res.redirect "/switch_channel/#{article.get('channel_id') or article.get('partner_channel_id')}?redirect-to=#{req.url}"
      else
        render req, res, article

render = (req, res, article) ->
  res.locals.sd.ARTICLE = article.toJSON()
  channel = new Channel req.user.get('current_channel')
  getSessionsForChannel channel, (sessions) ->
    res.locals.sd.CURRENT_SESSION = sessions[article.id]
    view = if res.locals.sd.IS_MOBILE then 'mobile/index' else 'layout/index'
    res.render view, article: article

setChannelIndexable = (channel, article) ->
  noIndex = sd.NO_INDEX_CHANNELS.split '|'
  if noIndex.includes channel.get('id')
    article.set 'indexable', false
