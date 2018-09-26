import PropTypes from "prop-types"
import React from "react"

//
// STRATEGIES
//
export const findEntities = (type, contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity()
    return (
      entityKey !== null && contentState.getEntity(entityKey).getType() === type
    )
  }, callback)
}

export const findLinkEntities = (contentBlock, callback, contentState) => {
  exports.findEntities("LINK", contentBlock, callback, contentState)
}

//
// COMPONENTS
//
export const Link = props => {
  const { children, contentState, entityKey } = props
  const { url, className } = contentState.getEntity(entityKey).getData()
  const artist = url.split("/artist/")[1]

  if (className === "is-follow-link") {
    return (
      <span>
        <a href={url} className={className}>
          {children}
        </a>
        <a data-id={artist} className="entity-follow artist-follow" />
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

Link.propTypes = {
  children: PropTypes.any,
  contentState: PropTypes.object,
  entityKey: PropTypes.string,
}

//
// TODO: Backfill out content-end spans and remove
//
export const setContentEnd = html => {
  const doc = document.createElement("div")
  doc.innerHTML = html
  // Remove existing end spans
  $(doc.getElementsByClassName("content-end")).replaceWith("")

  return doc.innerHTML
}
