_ = require 'underscore'
Organizations = require '../../collections/organizations'
Organization = require '../../models/organization'

@index = (req, res) ->
  new Organizations().fetch
    data: limit: 100
    error: res.backboneError
    success: (organizations) ->
      res.render 'index', organizations: organizations

@edit = (req, res) ->
  new Organization(id: req.params.id).fetch
    error: res.backboneError
    success: (organization) ->
      res.locals.sd.ORGANIZATION = organization.toJSON()
      res.render 'edit', organization: organization

@save = (req, res) ->
  new Organization(id: req.params.id).save req.body,
    headers: 'X-Access-Token': req.user?.get('access_token')
    error: res.backboneError
    success: ->
      res.redirect '/organizations'
