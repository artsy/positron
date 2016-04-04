_ = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data
{ ArtworkHelpers } = require 'artsy-backbone-mixins'
AdditionalImages = require '../collections/additional_images.coffee'

module.exports = class Artwork extends Backbone.Model

  _.extend @prototype, ArtworkHelpers

  urlRoot: "#{sd.ARTSY_URL}/api/v1/artwork"

  truncatedLabel: ->
    split = @get('artist').name.split ' '
    artistInitials = split[0][0] + '.' + split[1]?[0] + '.'
    artistInitials + ' ' + @get('title') + ', ' + @get('date')

  defaultImage: ->
    new AdditionalImages(@get('images')).default()

  denormalized: ->
    type: 'artwork'
    id: @get('_id')
    slug: @get('id')
    date: @get('date')
    title: @get('title')
    image: @defaultImage().bestImageUrl(['larger','large', 'medium', 'small'])
    partner:
      name: @getPartnerName()
      slug: @getPartnerLink()
    artist:
      name: @getArtistName()
      slug: @get('artist')?.id

  getArtistName: ->
    if @get('artist')?.name
      @get('artist').name
    else if @get('artists')?.length > 0
      _.compact(@get('artists').pluck('name'))[0]
    else
      ''

  getPartnerName: ->
    if @get('collecting_institution')?.length > 0
      @get('collecting_institution')
    else if @get('partner')
      @get('partner').name
    else
      ''

  getPartnerLink: ->
    partner = @get('partner')
    return unless partner and partner.type isnt 'Auction'
    if partner.default_profile_public and partner.default_profile_id
      return partner.default_profile_id
