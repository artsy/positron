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
      if href.match('google')
        href = decodeURIComponent( href.replace('https://www.google.com/url?q=','') )
        href = _.first(href.split('&'))
      if href.match(resource) then _.last href.split('/') else null
    ).toArray()

  fetchSlideshowArtworks: (options) ->
    return throw Error 'Not a slideshow' unless @get('type') is 'slideshow'
    ids = (item.id for item in @get('items') when item.type is 'artwork')
    @artworks.getOrFetchIds ids,
      error: options.error
      success: => options.success arguments...

  @getIframeUrl: (src) ->
    if src.match 'youtu'
      id = _.last src.split '/'
      id = id.split('v=')[1] if id.match 'watch'
      "//www.youtube.com/embed/#{id}"
    else if src.match 'vimeo'
      id = _.last src.split '/'
      "//player.vimeo.com/video/#{id}?color=ffffff"

  toJSON: ->
    if @get('type') is 'artworks'
      _.extend super, ids: @artworks.pluck '_id'
    else
      super