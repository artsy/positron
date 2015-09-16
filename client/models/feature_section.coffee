Backbone = require 'backbone'
sd = require('sharify').data

module.exports = class FeatureSection extends Backbone.Model

  urlRoot: "#{sd.API_URL}/sections"

  defaults:
    featured_links: []