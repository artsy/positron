React = require 'react'

{ ContentState
  Editor
  EditorState } = require 'draft-js'

{ a } = React.DOM

exports.findLinkEntities = (contentBlock, callback, contentState) ->
  contentBlock.findEntityRanges ((character) ->
    entityKey = character.getEntity()
    entityKey != null and contentState.getEntity(entityKey).getType() == 'LINK'
  ), callback
  return

exports.Link = (props) ->
  {url} = props.contentState.getEntity(props.entityKey).getData()
  return (
    a {
      href: url
    }, props.children
  )