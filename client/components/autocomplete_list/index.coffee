_ = require 'underscore'
React = require 'react'
ReactDOM = require 'react-dom'
Autocomplete = null
{ label, input, div, button, span } = React.DOM
sd = require('sharify').data
async = require 'async'
request = require 'superagent'

module.exports = AutocompleteList = React.createClass
  displayName: 'AutocompleteList'

  getInitialState: ->
    loading: true
    items: []
    focus: false

  componentDidMount: ->
    @$input = $(ReactDOM.findDOMNode(this)).find('.autocomplete-input')
    @addAutocomplete()
    @fetchItems()

  fetchItems: ->
    if @props.idsToFetch?.length > 0
      fetchedItems = []
      async.each @props.idsToFetch, (id, cb) =>
        request
          .get(@props.fetchUrl(id))
          .set('X-Access-Token': sd.USER?.access_token)
          .end (err, res) =>
            fetchedItems.push(@props.resObject(res))
            cb()
      , =>
        @setState loading: false, items: _.compact fetchedItems
    else
      @setState loading: false

  addAutocomplete: ->
    search = new Bloodhound
      datumTokenizer: Bloodhound?.tokenizers?.obj?.whitespace('value')
      queryTokenizer: Bloodhound?.tokenizers?.whitespace
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

  onSelect: (e, item) ->
    items = _.reject(@state.items, (i) -> i.id is item.id).concat [item]
    unless items.length and items.length is @state.items.length
      @props.selected? e, item, items
      @setState items: items
    @$input.typeahead('val', '')

  onBlur: ->
    @setState focus: false
    @$input.typeahead('val', '')

  onFocus: ->
    @setState focus: true

  removeItem: (item) -> (e) =>
    e.preventDefault()
    @$input.typeahead('destroy')?.val('')
    newItems = _.reject(@state.items, (i) -> i.id is item.id)
    @setState items: _.uniq newItems
    @props.removed? e, item, newItems
    @addAutocomplete()
    @$input.focus()

  printItems: ->
    for item, i in @state.items
      div { className: 'autocomplete-select-selected', key: 'selected-' + item.id },
        span {className: 'selected' }, item.value
        input { type: 'hidden', value: item.id, name: @props.name }
        button { className: 'remove-button', onClick: @removeItem(item) }

  render: ->
    inline = if @props.inline then ' autocomplete-container--inline' else ''
    focus = if @props.inline and @state.focus then ' is-focus' else ''

    div { className: 'autocomplete-container' + inline + focus},
      (
        if @props.inline
          @printItems()
        else
          div { className: 'autocomplete-selected'},
            @printItems()
      )
      input {
        className: 'bordered-input autocomplete-input'
        placeholder: if @state.items.length and @props.inline then '' else @props.placeholder
        onBlur: @onBlur
        disabled: @props.disabled
        onFocus: @onFocus
      }
