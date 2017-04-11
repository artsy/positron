React = require 'react'
_ = require 'underscore'
{ div, button } = React.DOM

module.exports = React.createClass
  displayName: 'TagList'

  render: ->
    div { className: 'tag-list__results' },
      unless @props.tags?.length
        div { className: 'tag-list__no-results' }, "No Results Found"
      (@props.tags?.map (result) =>
        div { className: 'tag-list__result', key: result.id},
          result.name,
          div {
            className: 'remove-button'
            onClick: => @props.deleteTag(result)
          }
      )
