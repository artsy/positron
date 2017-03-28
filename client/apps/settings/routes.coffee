_ = require 'underscore'
Curations = require '../../collections/curations'
Curation = require '../../models/curation'
Channels = require '../../collections/channels'
Channel = require '../../models/channel'
Tags = require '../../collections/tags'
Tag = require '../../models/tag'

@index = (req, res) ->
  res.render 'index'

@curations = (req, res) ->
  new Curations().fetch
    data: limit: 100
    error: res.backboneError
    success: (curations) ->
      res.render 'curations/curations_index', curations: curations

@editCuration = (req, res) ->
  new Curation(id: req.params.id).fetch
    error: res.backboneError
    success: (curation) ->
      res.locals.sd.CURATION = curation.toJSON()
      res.render 'curations/curation_edit', curation: curation

@saveCuration = (req, res) ->
  data = _.pick req.body, _.identity
  new Curation(id: req.params.id).save data,
    headers: 'X-Access-Token': req.user?.get('access_token')
    error: res.backboneError
    success: (curation) ->
      res.locals.sd.CURATION = curation.toJSON()
      res.redirect "/settings/curations/#{curation.get('id')}/edit"

@channels = (req, res) ->
  new Channels().fetch
    data: limit: 100
    error: res.backboneError
    success: (channels) ->
      res.render 'channels/channels_index', channels: channels

@editChannel = (req, res) ->
  new Channel(id: req.params.id).fetch
    error: res.backboneError
    success: (channel) ->
      res.locals.sd.CHANNEL = channel.toJSON()
      res.render 'channels/channel_edit', channel: channel

@saveChannel = (req, res) ->
  data = _.pick req.body, _.identity
  new Channel(id: req.params.id).save data,
    headers: 'X-Access-Token': req.user?.get('access_token')
    error: res.backboneError
    success: ->
      res.redirect '/settings/channels'

@tags = (req, res) ->
  new Tags().fetch
    data: limit: 100
    error: res.backboneError
    success: (channels) ->
      res.render 'tags/tag_index', tags: tags

@editTag = (req, res) ->
  new Tag(id: req.params.id).fetch
    error: res.backboneError
    success: (tag) ->
      res.locals.sd.TAG = tag.toJSON()
      res.render 'tags/tag_edit', tag: tag

@saveTag = (req, res) ->
  data = _.pick req.body, _.identity
  new Tag(id: req.params.id).save data,
    headers: 'X-Access-Token': req.user?.get('access_token')
    error: res.backboneError
    success: ->
      res.redirect '/settings/tags'
