_ = require 'underscore'
query = require './query.coffee'
Lokka = require('lokka').Lokka
Transport = require('lokka-transport-http').Transport
{ API_URL } = process.env

@articles_list = (req, res, next) ->
  channel_id = req.user?.get('current_channel').id
  publishedQuery = query "published: true, channel_id: \"#{channel_id}\""
  headers =
    'X-Access-Token': req.user.get('access_token')

  client = new Lokka
    transport: new Transport(API_URL + '/graphql', {headers})

  client.query(publishedQuery)
    .then (result) =>
      res.locals.sd.ARTICLES = result.articles
      res.locals.sd.CURRENT_CHANNEL = req.user?.get('current_channel')
      res.render 'index',
        articles: result.articles || []
        published: true
        current_channel: req.user?.get('current_channel')
    .catch -> next()