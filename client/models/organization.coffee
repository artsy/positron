Backbone = require 'backbone'
sd = require('sharify').data

module.exports = class Organization extends Backbone.Model

  urlRoot: "#{sd.API_URL}/organizations"
