_ = require 'underscore'
Backbone = require 'backbone'
moment = require 'moment'
LinkSet = require '../models/link_set.coffee'
sd = require('sharify').data
{ ApiCollection } = require './mixins.coffee'

module.exports = class LinkSets extends Backbone.Collection

  _.extend @prototype, ApiCollection

  url: "#{sd.API_URL}/links"

  model: LinkSet

  toPaginatedListItems: ->
    @map (linkSet) ->
      title: linkSet.get('title')
      href: "/links/#{linkSet.get('id')}/edit"
