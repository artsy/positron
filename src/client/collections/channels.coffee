_ = require 'underscore'
Backbone = require 'backbone'
moment = require 'moment'
Channel = require '../models/channel.coffee'
sd = require('sharify').data
{ ApiCollection } = require './mixins.coffee'

module.exports = class Channels extends Backbone.Collection

  _.extend @prototype, ApiCollection

  url: "#{sd.API_URL}/channels"

  model: Channel

  toPaginatedListItems: ->
    @map (channel) ->
      name: channel.get('name')
      href: "/settings/channels/#{channel.get('id')}/edit"
