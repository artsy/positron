_ = require 'underscore'
Backbone = require 'backbone'
moment = require 'moment'
Organization = require '../models/organization.coffee'
sd = require('sharify').data
{ ApiCollection } = require './mixins.coffee'

module.exports = class Organizations extends Backbone.Collection

  _.extend @prototype, ApiCollection

  url: "#{sd.API_URL}/organizations"

  model: Organization

  toPaginatedListItems: ->
    @map (organization) ->
      imgSrc: organization.get('icon_url')
      title: organization.get('name')
      href: "/organizations/#{organization.get('id')}/edit"