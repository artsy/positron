_ = require 'underscore'
React = require 'react'
ReactDOM = require 'react-dom'
Autocomplete = null
{ label, input, div, button } = React.DOM

module.exports = (el, props) ->
  ReactDOM.render React.createElement(AutocompleteList, props), el

module.exports.AutocompleteList = AutocompleteList = React.createClass

  getInitialState: ->
    loading: true, items: @props.items or []

  componentDidMount: ->
    @addAutocomplete()

  addAutocomplete: ->
    Autocomplete ?= require '../autocomplete/index.coffee'
    @autocomplete = new Autocomplete _.extend _.pick(@props, 'url', 'filter'),
      el: $(@refs.input)
      selected: (e, item) =>
        # Deferring because of click race condition
        _.defer => @onSelect e, item

  onSelect: (e, item) ->
    @setState items: @state.items.concat [item]
    $(@refs.input).val('').focus()
    @props.selected? e, item, @state.items

  removeItem: (item) -> (e) =>
    e.preventDefault()
    newItems = _.reject(@state.items, (i) -> i.id is item.id)
    @setState items: newItems
    @props.removed? e, item, newItems

  render: ->
    div { ref: 'container' },
      (
        for item in @state.items
          div { className: 'autocomplete-select-selected' }, item.value,
            input { type: 'hidden', value: item.id, name: @props.name }
            button { className: 'autocomplete-select-remove', onClick: @removeItem(item) }
      )
      input {
        ref: 'input'
        className: 'bordered-input'
        placeholder: @props.placeholder
      }