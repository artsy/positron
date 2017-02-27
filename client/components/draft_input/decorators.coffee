React = require 'react'

{ ContentState
  Editor
  EditorState } = require 'draft-js'

{ a, span } = React.DOM

exports.findLinkEntities = (contentBlock, callback, contentState) ->
  contentBlock.findEntityRanges ((character) ->
    entityKey = character.getEntity()
    entityKey != null and contentState.getEntity(entityKey).getType() == 'LINK'
  ), callback
  return

exports.Link = (props) ->
  { url, className } = props.contentState.getEntity(props.entityKey).getData()
  text = props.decoratedText
  if className is 'is-jump-link'
    link = a {
      'data-name': url
    }, props.children
  else if className is 'is-follow-link'
    link = a {
        href: url
        'data-name': 'artist'
        className: className
      }, props.children
  else
    link = a {
      href: url
      'data-name': 'link'
    }, props.children
  return (
    link
  )
