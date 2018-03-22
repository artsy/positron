_ = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data

module.exports = class Artist extends Backbone.Model

  urlRoot: "#{sd.ARTSY_URL}/api/v1/artist"