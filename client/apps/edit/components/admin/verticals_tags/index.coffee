React = require 'react'
ReactDOM = require 'react-dom'
_ = require 'underscore'
_s = require 'underscore.string'
{ div, section, label, input } = React.DOM

module.exports = React.createClass
  displayName: 'AdminTags'

  componentDidMount: ->
    ReactDOM.findDOMNode(@refs.container).classList += ' active'

  onChange: (e) ->
    tagsArray = e.target.value.split(",").map (tag) -> _s.clean(tag)
    tagsArray = if tagsArray.length is 0 then [] else tagsArray.filter(Boolean)
    @props.onChange e.target.name, _.uniq(tagsArray)

  render: ->
    section { className: 'edit-admin--verticals-tags edit-admin__fields', ref: 'container'},
      div {className: 'fields-right'},
        div {className: 'field-group'},
          label {}, 'Topic Tags'
          input {
            className: 'bordered-input'
            placeholder: 'Start typing a topic tag...'
            defaultValue: @props.article.get('tags')?.join(', ') or ''
            name: 'tags'
            onChange: @onChange
          }
      div {className: 'fields-left'},
        div {className: 'field-group'},
          label {}, 'Tracking Tags'
          input {
            className: 'bordered-input'
            placeholder: 'Start typing a tracking tag...'
            defaultValue: @props.article.get('tracking_tags')?.join(', ') or ''
            name: 'tracking_tags'
            onChange: @onChange
          }
