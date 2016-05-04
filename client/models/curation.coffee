Backbone = require 'backbone'
sd = require('sharify').data

module.exports = class Curation extends Backbone.Model

  urlRoot: "#{sd.API_URL}/curations"
