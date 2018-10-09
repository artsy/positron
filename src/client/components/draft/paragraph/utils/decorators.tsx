import { CompositeDecorator, ContentBlock, ContentState } from "draft-js"
import React, { ReactChild } from "react"
import { Decorator } from "../../typings"

/**
 * Used when creating an editor, determines
 * which entities are allowed, and how find
 * and render them in the Editor component
 */
export const decorators = (hasLinks: boolean) => {
  const allowedDecorators = getDecorators(hasLinks)
  return new CompositeDecorator(allowedDecorators)
}

/**
 * Separated from #decorators for testing purposes
 */
export const getDecorators = (hasLinks: boolean) => {
  const allowedDecorators: Decorator = []

  if (hasLinks) {
    allowedDecorators.push({
      strategy: findLinkEntities,
      component: Link,
    })
  }
  return allowedDecorators
}

/**
 * Used by decorator to find existing link entities from a contentBlock
 */
export const findLinkEntities = (
  contentBlock: ContentBlock,
  callback: (start: number, end: number) => void,
  contentState: ContentState
) => {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity()
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === "LINK"
    )
  }, callback)
}

/**
 * Used by decorator to render links in draft's Editor component
 */
export const Link = (props: LinkProps) => {
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

export interface LinkProps {
  children: ReactChild
  contentState: ContentState
  entityKey: string
}
