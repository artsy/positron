_ = require 'underscore'
query = require './query.coffee'
Lokka = require('lokka').Lokka
Transport = require('lokka-transport-http').Transport
{ API_URL } = process.env

@sortable_list = (req, res, next) ->
  channel_id = req.user?.get('current_channel').id
  scheduledQuery = query "published: true, channel_id: \"#{channel_id}\""
  headers =
    'X-Access-Token': req.user.get('access_token')

  client = new Lokka
    transport: new Transport(API_URL + '/graphql', {headers})

  client.query(scheduledQuery)
    .then (result) =>
      res.locals.sd.SCHEDULED_ARTICLES = result.articles
      res.locals.sd.CURRENT_CHANNEL = req.user?.get('current_channel')
      res.render 'index',
        articles: result.articles
        published: true
        current_channel: req.user?.get('current_channel')
    .catch -> next()



  # page = parseInt req.query.page
  # size = 10
  # new Articles().fetch
  #   data:
  #     offset: if page then (page - 1) * size else 0
  #     limit: size
  #     channel_id: req.user?.get('current_channel').id
  #     published: published = req.query.published is 'true'
  #   headers: 'x-access-token': req.user?.get('access_token')
  #   error: res.backboneError
  #   success: (articles) ->
  #     res.render 'index',
  #       articles: articles
  #       published: published
  #       page: page or 1
  #       totalPages: Math.ceil(articles.count / size)
  #       current_channel: req.user?.get('current_channel')