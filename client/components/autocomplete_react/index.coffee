#
# A lightweight React wrapper around typeahead to add styling/common behavior.
#

_ = require 'underscore'
React = require 'react'
ReactDOM = require 'react-dom'
# Autocomplete = null
# { label, input, div, button } = React.DOM

module.exports = (el, props) ->
  ReactDOM.render React.createElement(AutocompleteList, props), el

module.exports.AutocompleteList = AutocompleteList = React.createClass
  displayName: 'AutocompleteList'

  getInitialState: ->
    loading: true, items: @props.items or []

module.exports = class ReactAutocomplete extends Backbone.View

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
    options.templates ?= {}
    options.templates?.empty ?= -> """
      <div class='autocomplete-empty'>No results</div>
    """
    @$el.typeahead null,
      name: options.name or _.uniqueId()
      source: search.ttAdapter()
      templates: options.templates
    @$el.on 'typeahead:selected', options.selected

  remove: ->
    super
    $(@el).typeahead('destroy')
