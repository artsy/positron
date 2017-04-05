React = require 'react'
ReactDOM = require 'react-dom'
{ div, label, input } = React.DOM
_s = require 'underscore.string'

module.exports = React.createClass
  displayName: 'AdminVerticalsTags'

  onChange: (e) ->
    tagsArray = e.target.value.split(",").map (tag) -> _s.clean(tag)
    tagsArray = if tagsArray.length is 0 then [] else tagsArray.filter(Boolean)
    @props.onChange('tags', tagsArray)

  render: ->
    div { className: 'edit-admin--verticals-tags edit-admin__fields'},
      div {className: 'fields-left'},
        div {className: 'field-group'},
          label {}, 'Tags'
          input {
            className: 'bordered-input'
            placeholder: 'Start typing tags...'
            defaultValue: @props.article.get('tags').join(', ') || ''
            onChange: @onChange
          }
