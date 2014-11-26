_  = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data

module.exports = class CurrentUser extends Backbone.Model

  url: "#{sd.API_URL}/users/me"

  iconUrl: ->
    _.values(@get('icon_urls'))[0]?.replace('jpg', 'png')

  isAdmin: ->
    @get('details').type is 'Admin'