sd = require('sharify').data
Backbone = require 'backbone'
SpookyModel = require './spooky.coffee'

module.exports = class Section extends SpookyModel
  modelName: 'section'