React = require 'react'

{ ContentState
  Editor
  EditorState } = require 'draft-js'

{ a, span } = React.DOM

exports.findLinkEntities = (contentBlock, callback, contentState) ->
  contentBlock.findEntityRanges ((character) ->
    entityKey = character.getEntity()
    entityKey isnt null and contentState.getEntity(entityKey).getType() is 'LINK'
  ), callback
  return

exports.Link = (props) ->
  { url, className, name } = props.contentState.getEntity(props.entityKey).getData()
  text = props.decoratedText
  if className?.includes('is-jump-link') and className?.includes('is-follow-link')
    link = span {},
      a {
        href: url
        name: props.decoratedText
        className: className
      }, props.children
      a {
        className: 'entity-follow artist-follow'
      }
  else if className is 'is-jump-link'
    link = a {
      name: props.decoratedText
      className: className
    }, props.children
  else if className is 'is-follow-link'
    link = span {},
      a {
        href: url
        className: className
      }, props.children
      a {
        className: 'entity-follow artist-follow'
      }
  else
    link = a {
      href: url
      className: className
    }, props.children
  return (
    link
  )
