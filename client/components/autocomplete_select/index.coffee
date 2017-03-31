_ = require 'underscore'
React = require 'react'
ReactDOM = require 'react-dom'
Autocomplete = null
{ label, input, div, button } = React.DOM

module.exports = (el, props) ->
  ReactDOM.render React.createElement(AutocompleteSelect, props), el

module.exports.AutocompleteSelect = AutocompleteSelect = React.createClass
  displayName: 'AutocompleteSelect'

  getInitialState: ->
    loading: true, value: null, id: null

  clear: ->
    @setState { value: null }, =>
      # Deferring to focus after render happens
      _.defer =>
        $(@refs.input).focus()
      @props.cleared()

  componentDidUpdate: ->
    return unless not @state.loading and not @state.value
    @autocomplete?.remove()
    @addAutocomplete()

  addAutocomplete: ->
    Autocomplete ?= require '../autocomplete/index.coffee'
    @autocomplete = new Autocomplete _.extend _.pick(@props, 'url', 'filter'),
      el: $(@refs.input)
      selected: (e, item) =>
        # Deferring because of click race condition
        _.defer =>
          @setState value: item.value, id: item.id
        @props.selected? e, item

  render: ->
    hidden = input { type: 'hidden', value: @state.id || '', name: @props.name }
    if @state.loading
      label { className: 'bordered-input-loading' }, @props.label,
        input { className: 'bordered-input' }
        hidden
    else if @state.value
      label {}, @props.label,
        div { className: 'autocomplete-select-selected' }, @state.value,
          button { className: 'remove-button', onClick: @clear }
        hidden
    else
      label {}, @props.label,
        input {
          ref: 'input'
          className: 'bordered-input'
          placeholder: @props.placeholder
        }
        hidden