_ = require 'underscore'
Backbone = require 'backbone'
Author = require '../models/author.coffee'
sd = require('sharify').data

module.exports = class Authors extends Backbone.Collection

  url: "#{sd.API_URL}/authors"

  model: Author
