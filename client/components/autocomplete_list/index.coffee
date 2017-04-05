_ = require 'underscore'
React = require 'react'
ReactDOM = require 'react-dom'
Autocomplete = null
{ label, input, div, button } = React.DOM
sd = require('sharify').data
async = require 'async'
request = require 'superagent'

module.exports = (el, props) ->
  ReactDOM.render React.createElement(AutocompleteList, props), el

module.exports.AutocompleteList = AutocompleteList = React.createClass
  displayName: 'AutocompleteList'

  getInitialState: ->
    loading: true
    items: []
    value: ''

  componentDidMount: ->
    @$input = $(ReactDOM.findDOMNode(this)).find('.autocomplete-input')
    # console.log @$input
    @addAutocomplete()
    @fetchItems()

  fetchItems: ->
    if @props.idsToFetch?.length > 0
      fetchedItems = []
      async.each @props.idsToFetch, (id, cb) =>
        request
          .get(@props.urlForItem(id))
          .set('X-Access-Token': sd.USER.access_token).end (err, res) =>
            fetchedItems.push(@props.resObject(res))
            cb()
      , =>
        @setState loading: false, items: fetchedItems
    else
      @setState loading: false

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
            console.log 'complete'
            console.log @$input
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

  onSelect: (e, item) ->
    @setState items: @state.items.concat [item]
    @setState value: ''
    @props.selected? e, item, @state.items

  removeItem: (item) -> (e) =>
    e.preventDefault()
    @$input.typeahead('destroy')
    newItems = _.reject(@state.items, (i) -> i.id is item.id)
    @setState items: newItems
    @props.removed? e, item, newItems

  handleChange: (e) ->
    @setState value: e.target.value

  render: ->
    div { className: 'autocomplete-container' },
      (
        for item in @state.items
          div { className: 'autocomplete-select-selected', key: item.value }, item.value,
            input { type: 'hidden', value: item.id, name: @props.name }
            button { className: 'remove-button', onClick: @removeItem(item) }
      )
      input {
        className: 'bordered-input autocomplete-input'
        placeholder: @props.placeholder
        value: @state.value
        onChange: @handleChange
      }