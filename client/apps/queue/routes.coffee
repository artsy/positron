_ = require 'underscore'
query = require './query.coffee'
Lokka = require('lokka').Lokka
Transport = require('lokka-transport-http').Transport
{ API_URL } = process.env

@queue = (req, res, next) ->
  published = true
  channel_id = req.user?.get('current_channel').id
  queuedQuery = query "daily_email: true"
  latestQuery = query "channel_id: \"#{channel_id}\", published: true, sort: \"-published_at\", daily_email: false"

  client = new Lokka
    transport: new Transport(API_URL + '/graphql')

  client.query(queuedQuery).then (result) =>
    if result.error
      return res.backboneError
    res.locals.sd.QUEUED_ARTICLES = result.articles
    client.query(latestQuery).then (result) =>
      if result.error
        return res.backboneError
      res.locals.sd.PUBLISHED_ARTICLES = result.articles
      res.locals.sd.CURRENT_CHANNEL = req.user?.get('current_channel')
      res.render 'index',
        published: true
        current_channel: req.user?.get('current_channel')
