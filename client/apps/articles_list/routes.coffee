_ = require 'underscore'
query = require './query.coffee'
Lokka = require('lokka').Lokka
Transport = require('lokka-transport-http').Transport
{ API_URL } = process.env
{ getSessionsForChannel } = require '../websocket'

@articles_list = (req, res, next) ->
  channel_id = req.user?.get('current_channel').id

  if req.query?.published == 'false' then published = false else published = true
  theQuery = query "published: #{published}, channel_id: \"#{channel_id}\""

  headers =
    'X-Access-Token': req.user.get('access_token')

  client = new Lokka
    transport: new Transport(API_URL + '/graphql', {headers})

  client.query(theQuery)
    .then (result) =>
      if result.articles.length > 0
        renderArticles res, req, result, published
      else
        unpublishedQuery = query "published: false, channel_id: \"#{channel_id}\""
        client.query(unpublishedQuery)
          .then (result) =>
            renderArticles res, req, result, false
    .catch -> next()


renderArticles = (res, req, result, published) ->
  res.locals.sd.ARTICLES = result.articles
  channel = res.locals.sd.CURRENT_CHANNEL = req.user?.get('current_channel')
  res.locals.sd.ARTICLES_IN_SESSION = getSessionsForChannel channel
  res.locals.sd.HAS_PUBLISHED = published
  res.render 'index',
    articles: result.articles || []
    current_channel: channel
