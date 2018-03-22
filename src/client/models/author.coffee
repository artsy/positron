Backbone = require 'backbone'
sd = require('sharify').data

module.exports = class Author extends Backbone.Model

  urlRoot: "#{sd.API_URL}/authors"
