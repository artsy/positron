_ = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data

module.exports = class Collection extends Backbone.Model

  urlRoot: "#{sd.ARTSY_URL}/api/v1/collection"

  denormalized: ->
    type: 'collection'
    id: @get('_id')
    slug: @get('id')
    image_url: @get('image_url')


  # TODO: I don't think this is used by collection
  fetchChannelOrPartner: (options) ->
    request.get("#{sd.API_URL}/collection/#{@get('id')}")
      .set('X-Xapp-Token': artsyXapp.token)
      .end (err, res) ->
        if err
          cb null, {}
        else
          cb null, res
