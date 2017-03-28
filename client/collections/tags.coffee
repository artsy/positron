_ = require 'underscore'
Backbone = require 'backbone'
moment = require 'moment'
Tag = require '../models/tag.coffee'
sd = require('sharify').data
{ ApiCollection } = require './mixins.coffee'

module.exports = class Tags extends Backbone.Collection

  _.extend @prototype, ApiCollection

  url: "#{sd.API_URL}/tags"

  model: Channel

  toPaginatedListItems: ->
    @map (channel) ->
      name: tag.get('name')
      href: "/settings/tags/#{tag.get('id')}/edit"
