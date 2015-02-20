_  = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data
{ User } = require './mixins.coffee'

module.exports = class CurrentUser extends Backbone.Model

  _.extend @prototype, User

  url: "#{sd.API_URL}/users/me"