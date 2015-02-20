_  = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data
UserMixin = require('./mixins.coffee').User

module.exports = class User extends Backbone.Model

  _.extend @prototype, UserMixin

  url: "#{sd.API_URL}/users/:id"
