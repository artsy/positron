React = require 'react'
{ label, input, div, button } = React.DOM

module.exports = React.createClass

  getInitialState: ->
    loading: true, value: null

  render: ->
    if @state.loading
      label { className: 'bordered-input-loading' },
        input { className: 'bordered-input' }
    else if @state.value
      [
        label { className: 'bordered-input-loading' },
          input { className: 'bordered-input' }
        div { className: 'autocomplete-select-selected' }, @state.value
        button { className: 'autocomplete-select-remove' } X
      ]
    else
      label {},
        input { className: 'bordered-input', placeholder: 'Search by fair name...' }