Backbone = require 'backbone'
sd = require('sharify').data

module.exports = class Tag extends Backbone.Model

  urlRoot: "#{sd.API_URL}/tags"
