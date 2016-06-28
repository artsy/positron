_ = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data
async = require 'async'
request = require 'superagent'
artsyXapp = require('artsy-xapp').token or ''

module.exports = class Channel extends Backbone.Model

  urlRoot: "#{sd.API_URL}/channels"

  hasFeature: (feature) ->
    type = @get('type')
    if type is 'editorial'
      _.contains [
        'header'
        'superArticle'
        'text'
        'artworks'
        'images'
        'image_set'
        'video'
        'embed'
        'callout'
        'toc'
        'follow'
        'layout'
      ], feature
    else if type is 'team'
      _.contains [
        'text'
        'artworks'
        'images'
        'image_set'
        'video'
        'embed'
        'callout'
        'follow'
      ], feature
    else if type is 'support'
      _.contains [
        'text'
        'artworks'
        'images'
        'video'
        'callout'
        'follow'
      ], feature
    else if type is 'partner'
       _.contains [
        'text'
        'artworks'
        'images'
        'video'
      ], feature

  hasAssociation: (association) ->
    type = @get('type')
    if type is 'editorial'
      _.contains [
        'artworks'
        'artists'
        'shows'
        'fairs'
        'partners'
        'auctions'
      ], association
    else if type is 'team'
      false
    else if type is 'support'
      _.contains [
        'artworks'
        'artists'
        'shows'
        'fairs'
        'partners'
        'auctions'
      ], association
    else if type is 'partner'
       false

  fetchChannelOrPartner: (options) ->
    async.parallel [
      (cb) =>
        request.get("#{sd.API_URL}/channels/#{@get('id')}")
          .set('X-Xapp-Token': artsyXapp).end cb
      (cb) =>
        request.get("#{sd.ARTSY_URL}/api/v1/partner/#{@get('id')}")
          .set('X-Xapp-Token': artsyXapp).end cb
    ], (err, results) ->
      if results[0]?.ok
        options.success(results[0].body)
      else if results[1]?.ok
        results[1].body.id = results[1].body._id
        options.success(results[1].body)
      else
        options.error(err)

  denormalized: ->
    {
      id: @get('id')
      name: @get('name')
      type: @get('type') or 'partner'
    }
