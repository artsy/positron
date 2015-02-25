_  = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data
UserMixin = require('./mixins.coffee').User

module.exports = class User extends Backbone.Model

  _.extend @prototype, UserMixin

  urlRoot: "#{sd.API_URL}/users"
