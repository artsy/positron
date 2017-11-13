_ = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data
Artworks = require '../collections/artworks.coffee'
url = require 'url'
cheerio = require 'cheerio'

module.exports = class Section extends Backbone.Model

  urlRoot: "#{sd.API_URL}/sections"

  initialize: ->
    @artworks = new Artworks

  slugsFromHTML: (str, resource) ->
    $ = cheerio.load(str)
    _.compact $('a').map( ->
      href = $(this).attr('href')
      if href?.match('google')
        href = decodeURIComponent( href.replace('https://www.google.com/url?q=','') )
        href = href.split('&')[0]
      if href?.match('artsy.net/' + resource)
        _.last url.parse(href).pathname?.split('/')
      else
        null
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
