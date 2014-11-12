_ = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data
Artworks = require '../collections/artworks.coffee'

module.exports = class Section extends Backbone.Model

  urlRoot: "#{sd.API_URL}/sections"

  initialize: ->
    @artworks = new Artworks

  slugsFromHTML: (attr, resource) ->
    return throw Error 'Missing jQuery' unless $? # TODO: Isomorphic DOM reader
    _.compact $(@get attr).find('a').map(->
      href = $(this).attr('href')
      if href.match(resource) then _.last href.split('/') else null
    ).toArray()