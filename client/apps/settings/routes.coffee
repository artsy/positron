_ = require 'underscore'
Curations = require '../../collections/curations'
Curation = require '../../models/curation'

@index = (req, res) ->
  new Curations().fetch
    data: limit: 100
    error: res.backboneError
    success: (curations) ->
      res.render 'index', curations: curations

@edit = (req, res) ->
  new Curation(id: req.params.id).fetch
    error: res.backboneError
    success: (curation) ->
      res.locals.sd.CURATION = curation.toJSON()
      res.render 'edit', curation: curation

@save = (req, res) ->
  data = _.pick req.body, _.identity
  new Curation(id: req.params.id).save data,
    headers: 'X-Access-Token': req.user?.get('access_token')
    error: res.backboneError
    success: ->
      res.redirect '/settings'
