Backbone = require 'backbone'
sd = require('sharify').data

module.exports = class CurrentUser extends Backbone.Model

  urlRoot: "#{sd.API_URL}/users/me"