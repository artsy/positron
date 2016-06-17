Backbone = require 'backbone'
sd = require('sharify').data
async = require 'async'

module.exports = class Channel extends Backbone.Model

  urlRoot: "#{sd.API_URL}/channels"

  getFeatures: ->
    switch @get 'type'
      when 'editorial' then {
        features: ['header', 'superArticle']
        sections: ['text', 'artworks', 'images', 'image_set', 'video', 'embed', 'callout', 'toc']
        associations: ['artworks', 'artists', 'shows', 'fairs', 'partners','auctions']
      }
      when 'team' then {
        features: []
        sections: ['text', 'artworks', 'images', 'image_set', 'video', 'embed', 'callout']
        associations: []
      }
      when 'support' then {
        features: []
        sections: ['text', 'artworks', 'images', 'video', 'callout']
        associations: ['artworks', 'artists', 'shows', 'fairs', 'partners','auctions']
      }
      when 'partner' then {
        features: []
        sections: ['text','artworks', 'images','video']
        associations: []
      }

  fetchChannelOrPartner: ->
    # async.map [

    # ], (err, results) ->
    #

  denormalized: ->
    {
      id: @get('id')
      name: @get('name')
      type: @get('type')
    }
