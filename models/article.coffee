Backbone = require 'backbone'

module.exports = class Article extends Backbone.Model

  stateName: ->
    if @get('state') is 0 then 'Draft' else 'Post'