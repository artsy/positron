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
  text = props.decoratedText.split(' ')[0]
  artist = url.split('/artist/')[1]
  if className?.includes('is-jump-link') and className?.includes('is-follow-link')
    link = span {},
      a {
        href: url
        name: text
        className: className
      }, props.children
      a {
        className: 'entity-follow artist-follow'
        'data-id' : artist
      }
  else if className is 'is-jump-link'
    link = a {
      name: text
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
        'data-id' : artist
      }
  else
    link = a {
      href: url
      className: className
    }, props.children
  return (
    link
  )
