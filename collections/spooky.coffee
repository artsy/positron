_ = require 'underscore'
Backbone = require 'backbone'

module.exports = class SpookyCollection extends Backbone.Collection
  initialize: ->
    throw new Error('Please define a modelName') unless @modelName?
    super

  parse: (response) ->
    @links = response._links
    _.pluck response._embedded, @modelName