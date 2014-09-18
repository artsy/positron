sd = require('sharify').data
Backbone = require 'backbone'
Section = require '../models/section.coffee'
SpookyCollection = require './spooky.coffee'

module.exports = class Sections extends SpookyCollection
  model: Section
  modelName: 'section'
  comparator: 'position'
  url: ->
    "#{sd.SPOOKY_URL}/api/articles/#{@id}/sections"


  initialize: (models, options = {}) ->
    { @id } = options
    throw new Error('Please set an id') unless @id?
    super