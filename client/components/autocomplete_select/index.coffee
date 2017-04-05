_ = require 'underscore'
React = require 'react'
ReactDOM = require 'react-dom'
Autocomplete = null
{ label, input, div, button } = React.DOM
sd = require('sharify').data
async = require 'async'
request = require 'superagent'

module.exports = (el, props) ->
  ReactDOM.render React.createElement(AutocompleteSelect, props), el

module.exports.AutocompleteSelect = AutocompleteSelect = React.createClass
  displayName: 'AutocompleteSelect'

  getInitialState: ->
    value: null
    id: null

  componentDidMount: ->
    @$input = $(ReactDOM.findDOMNode(this)).find('.autocomplete-input')
    @addAutocomplete()
    @fetchItem()

  addAutocomplete: ->
    search = new Bloodhound
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value')
      queryTokenizer: Bloodhound.tokenizers.whitespace
      remote:
        url: @props.url
        filter: @props.filter
        ajax:
          beforeSend: =>
            @$input.closest('.twitter-typeahead').addClass 'is-loading'
          complete: =>
            @$input.closest('.twitter-typeahead').removeClass 'is-loading'
    search.initialize()
    templates = @props.templates or {
      empty: """
        <div class='autocomplete-empty'>No results</div>
      """
    }
    @$input.typeahead { highlight: true },
      source: search.ttAdapter()
      templates: templates
    @$input.on 'typeahead:selected', @onSelect

  fetchItem: ->
    if @props.idToFetch
      request
        .get(@props.fetchUrl)
        .set('X-Access-Token': sd.USER?.access_token).end (err, res) =>
          @setState @props.resObject(res)

  removeItem: ->
    @setState value: null, id: null
    @addAutocomplete()
    @props.cleared()

  onSelect: (e, item) ->
    @setState value: item.value, id: item.id
    @props.selected? e, item

  render: ->
    if @state.id
      label {}, @props.label,
        div { className: 'autocomplete-select-selected' },
          @state.value
          button { className: 'remove-button', onClick: @removeItem }
    else
      label {}, @props.label,
        input {
          className: 'bordered-input autocomplete-input'
          placeholder: @props.placeholder
        }
