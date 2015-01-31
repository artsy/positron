_ = require 'underscore'
React = require 'react'
Autocomplete = null
{ label, input, div, button } = React.DOM

module.exports = (el, props) ->
  React.render AutocompleteSection(props), el

module.exports.AutocompleteSelect = AutocompleteSection = React.createClass

  getInitialState: ->
    loading: true, value: null

  clear: ->
    @setState { value: null }, -> $(@refs.input.getDOMNode()).focus()
    @props.cleared?()

  componentDidUpdate: ->
    return unless not @state.loading and not @state.value
    @autocomplete?.remove()

  addAutocomplete: ->
    Autocomplete ?= require '../autocomplete/index.coffee'
    @autocomplete = new Autocomplete _.extend _.pick(@props, 'url', 'filter'),
      el: $(@refs.input?.getDOMNode())
      selected: (e, item) =>
        @setState value: item.value
        @props.selected? e, item

  render: ->
    if @state.loading
      label { className: 'bordered-input-loading' },
        input { className: 'bordered-input' }
    else if @state.value
      div { className: 'autocomplete-select-selected' }, @state.value,
        button { className: 'autocomplete-select-remove', onClick: @clear }
    else
      label {},
        input {
          ref: 'input'
          className: 'bordered-input'
          placeholder: 'Search by fair name...'
        }
