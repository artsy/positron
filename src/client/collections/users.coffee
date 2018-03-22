_ = require 'underscore'
Backbone = require 'backbone'
User = require '../models/user.coffee'
sd = require('sharify').data
{ ApiCollection } = require './mixins.coffee'

module.exports = class Users extends Backbone.Collection

  _.extend @prototype, ApiCollection

  url: "#{sd.API_URL}/users"

  model: User