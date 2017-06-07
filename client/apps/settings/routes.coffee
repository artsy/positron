_ = require 'underscore'
Curations = require '../../collections/curations'
Curation = require '../../models/curation'
Channels = require '../../collections/channels'
Channel = require '../../models/channel'
Tags = require '../../collections/tags'

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
    data:
      limit: 50
      public: true
    error: res.backboneError
    success: (tags) ->
      res.locals.sd.TAGS = tags.toJSON()
      res.render 'tags/tags_index'

@authors = (req, res) ->
  new Authors().fetch
    data: limit: 100
    error: res.backboneError
    success: (authors) ->
      res.render 'authors/authors_index', authors: authors

@editAuthor = (req, res) ->
  new Author(id: req.params.id).fetch
    error: res.backboneError
    success: (author) ->
      res.locals.sd.AUTHOR = author.toJSON()
      res.render 'authors/author_edit', author: author

@saveAuthor = (req, res) ->
  data = _.pick req.body, _.identity
  new Author(id: req.params.id).save data,
    headers: 'X-Access-Token': req.user?.get('access_token')
    error: res.backboneError
    success: ->
      res.redirect '/settings/authors'