_ = require 'underscore'
query = require './query.coffee'
Lokka = require('lokka').Lokka
Transport = require('lokka-transport-http').Transport
{ API_URL } = process.env

@queue = (req, res, next) ->
  channel_id = req.user?.get('current_channel').id
  scheduledQuery = query "published: false, channel_id: \"#{channel_id}\", scheduled: true"
  headers = {
    'X-Access-Token': req.user.get('access_token')
  }

  client = new Lokka
    transport: new Transport(API_URL + '/graphql', {headers})

  client.query(scheduledQuery)
    .then (result) =>
      res.locals.sd.SCHEDULED_ARTICLES = result.articles
      res.locals.sd.CURRENT_CHANNEL = req.user?.get('current_channel')
      res.render 'index',
        published: true
        current_channel: req.user?.get('current_channel')
    .catch(next)
