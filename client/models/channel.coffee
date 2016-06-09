Backbone = require 'backbone'
sd = require('sharify').data

module.exports = class Channel extends Backbone.Model

  urlRoot: "#{sd.API_URL}/channels"
