_ = require 'underscore'
Backbone = require 'backbone'
moment = require 'moment'
Vertical = require '../models/vertical.coffee'
sd = require('sharify').data
{ ApiCollection } = require './mixins.coffee'

module.exports = class Verticals extends Backbone.Collection

  _.extend @prototype, ApiCollection

  url: "#{sd.API_URL}/verticals"

  model: Vertical

  toPaginatedListItems: ->
    @map (vertical) ->
      imgSrc: vertical.get('thumbnail_url')
      title: vertical.get('title')
      subtitle: (
        moment(vertical.get('start_at')).format('MMM Do') + ' – ' +
        moment(vertical.get('end_at')).format('MMM Do')
      )
      href: "/verticals/#{vertical.get('id')}/edit"