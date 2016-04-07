_  = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data

module.exports = class User extends Backbone.Model

  urlRoot: "#{sd.API_URL}/users"

  isEditorialTeam: ->
    (@get('type') is 'Admin' and @get('email')?.split('@')[0] in sd.EDITORIAL_TEAM?.split(',')) or @get('email') is sd.EDITORIAL_EMAIL

  isAdmin: ->
    @get('type') is 'Admin'
