Backbone = require 'backbone'
sd = require('sharify').data

module.exports = class BrandPartner extends Backbone.Model

  urlRoot: "#{sd.API_URL}/brand_partners"

  defaults:
    featured_links: []