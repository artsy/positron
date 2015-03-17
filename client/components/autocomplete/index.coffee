#
# A lightweight wrapper around typeahead to add styling/common behavior.
#

_ = require 'underscore'
Backbone = require 'backbone'

module.exports = class Autocomplete extends Backbone.View

  initialize: (options) ->
    search = new Bloodhound
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value')
      queryTokenizer: Bloodhound.tokenizers.whitespace
      remote:
        url: options.url
        filter: options.filter
        ajax:
          beforeSend: =>
            @$el.closest('.twitter-typeahead').addClass 'is-loading'
          complete: =>
            @$el.closest('.twitter-typeahead').removeClass 'is-loading'
    search.initialize()
    @$el.typeahead null,
      name: options.name or _.uniqueId()
      source: search.ttAdapter()
    @$el.on 'typeahead:selected', options.selected

  remove: ->
    super
    $(@el).typeahead('destroy')
