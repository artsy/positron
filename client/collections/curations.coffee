_ = require 'underscore'
Backbone = require 'backbone'
moment = require 'moment'
Curation = require '../models/curation.coffee'
sd = require('sharify').data
{ ApiCollection } = require './mixins.coffee'

module.exports = class Curations extends Backbone.Collection

  _.extend @prototype, ApiCollection

  url: "#{sd.API_URL}/curations"

  model: Curation

  toPaginatedListItems: ->
    @map (curation) ->
      name: curation.get('name')
      href: "/settings/curations/#{curation.get('id')}/edit"
