Backbone = require 'backbone'
sd = require('sharify').data

module.exports = class LinkSet extends Backbone.Model

  urlRoot: "#{sd.API_URL}/links"

  defaults:
    featured_links: []
