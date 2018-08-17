import PropTypes from 'prop-types'
import React from 'react'
import { CompositeDecorator } from 'draft-js'

/**
 * Used when creating an editor, determines
 * which entities are allowed, and how find
 * and render them in the Editor component
 */
export const decorators = hasLinks => {
  const decorators = getDecorators(hasLinks)
  return new CompositeDecorator(decorators)
}

/**
 * Separated from #decorators for testing purposes
 */
export const getDecorators = hasLinks => {
  let decorators = []

  if (hasLinks) {
    decorators.push({
      strategy: findLinkEntities,
      component: Link
    })
  }
  return decorators
}

/**
 * Used by decorator to find existing link entities from a contentBlock
 */
export const findLinkEntities = (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity()
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'LINK'
      )
    },
    callback
  )
}

/**
 * Used by decorator to render links in draft's Editor component
 */
export const Link = props => {
  const { children, contentState, entityKey } = props
  const { url } = contentState.getEntity(entityKey).getData()
  // Don't allow links to click through from editor
  const onClick = e => e.preventDefault()

  return (
    <a href={url} onClick={onClick}>
      {children}
    </a>
  )
}

Link.propTypes = {
  children: PropTypes.any,
  contentState: PropTypes.object,
  entityKey: PropTypes.string
}
