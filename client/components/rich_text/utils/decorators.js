import PropTypes from 'prop-types'
import React from 'react'

// STRATEGIES

export const findEntities = (type, contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity()
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === type
      )
    },
    callback
  )
}

export const findLinkEntities = (contentBlock, callback, contentState) => {
  exports.findEntities('LINK', contentBlock, callback, contentState)
}

export const findContentStartEntities = (contentBlock, callback, contentState) => {
  exports.findEntities('CONTENT-START', contentBlock, callback, contentState)
}

export const findContentEndEntities = (contentBlock, callback, contentState) => {
  exports.findEntities('CONTENT-END', contentBlock, callback, contentState)
}

// COMPONENTS

export const Link = (props) => {
  const { children, contentState, entityKey } = props
  const { url, className } = contentState.getEntity(entityKey).getData()
  const artist = url.split('/artist/')[1]

  if (className === 'is-follow-link') {
    return (
      <span>
        <a href={url} className={className}>
          {children}
        </a>
        <a data-id={artist} className='entity-follow artist-follow' />
      </span>
    )
  } else {
    return (
      <a href={url} className={className}>
        {children}
      </a>
    )
  }
}

export const ContentEnd = (props) => {
  const { contentState, entityKey } = props
  const type = contentState.getEntity(entityKey).getType()  
  return <span className={type.toLowerCase()} />
}

Link.propTypes = {
  children: PropTypes.any,
  contentState: PropTypes.object,
  entityKey: PropTypes.string
}

ContentEnd.propTypes = {
  contentState: PropTypes.object,
  entityKey: PropTypes.string
}
