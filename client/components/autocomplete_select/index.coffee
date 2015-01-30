_ = require 'underscore'
Autocomplete = require '../autocomplete/index.coffee'
React = require 'react'
{ label, input, div, button } = React.DOM

AutocompleteSection = React.createClass

  getInitialState: ->
    loading: true, value: null

  clear: ->
    @setState { value: null }, -> $(@refs.input.getDOMNode()).focus()

  componentDidUpdate: ->
    return unless not @state.loading and not @state.value
    @autocomplete?.remove()
    @autocomplete = new Autocomplete _.extend _.pick(@props, 'url', 'filter'),
      el: $(@refs.input.getDOMNode())
      selected: (e, item) =>
        @setState value: item.value

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

module.exports = (el, props) ->
  React.render AutocompleteSection(props), el
