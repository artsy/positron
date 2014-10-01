Backbone = require 'backbone'

module.exports = class Article extends Backbone.Model

  defaults:
    state: 0

  stateName: ->
    if @get('state') is 0 then 'Draft' else 'Post'