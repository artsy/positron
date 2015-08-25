_ = require 'underscore'
Backbone = require 'backbone'
moment = require 'moment'
BrandPartner = require '../models/brand_partner.coffee'
sd = require('sharify').data
{ ApiCollection } = require './mixins.coffee'

module.exports = class BrandPartners extends Backbone.Collection

  _.extend @prototype, ApiCollection

  url: "#{sd.API_URL}/brand-partners"

  model: BrandPartner

  toPaginatedListItems: ->
    @map (brandPartner) ->
      title: brandPartner.get('slug')
      href: "/brand-partners/#{brandPartner.get('id')}/edit"
      imgSrc: brandPartner.get('featured_links')[0]?.thumbnail_url if brandPartner.get('featured_links')[0]?.thumbnail_url?