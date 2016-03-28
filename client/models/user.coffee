_  = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data

module.exports = class User extends Backbone.Model

  urlRoot: "#{sd.API_URL}/users"

  @isEditorialTeam: (user) ->
    user.type is 'Admin' and user.email?.split('@')[0] in sd.EDITORIAL_TEAM?.split(',')
