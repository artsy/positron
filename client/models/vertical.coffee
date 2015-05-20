_ = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data

module.exports = class Vertical extends Backbone.Model

  urlRoot: "#{sd.API_URL}/verticals"