Backbone = require 'backbone'
sd = require('sharify').data

module.exports = class Vertical extends Backbone.Model

  urlRoot: "#{sd.API_URL}/verticals"

  defaults:
    featured_links: []