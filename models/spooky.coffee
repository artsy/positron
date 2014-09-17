Backbone = require 'backbone'

module.exports = class SpookyModel extends Backbone.Model
  initialize: ->
    throw new Error('Please define a modelName') unless @modelName?
    super

  parse: (response, options = {}) ->
    response = response[@modelName] unless options.collection
    @links = response._links
    delete response._links
    response