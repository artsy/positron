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
      slug: brandPartner.get('slug')
      href: "/brand-partners/#{brandPartner.get('id')}/edit"