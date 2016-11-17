_ = require 'underscore'
positronql = require '../../lib/positronql.coffee'
query = require './query.coffee'

@queue = (req, res, next) ->
  tab = req.query.tab or 'daily'
  size = 5
  published = true
  channel_id = req.user?.get('current_channel').id

  positronql
    query: query(published, channel_id)
    req: req
  .then (result) =>
    if result.error
      return res.backboneError

    res.locals.sd.PUBLISHED_ARTICLES = result.latest
    res.locals.sd.QUEUED_ARTICLES = result.queued
    res.locals.sd.CURRENT_CHANNEL = req.user?.get('current_channel')
    res.render 'index',
      published: true
      current_channel: req.user?.get('current_channel')
