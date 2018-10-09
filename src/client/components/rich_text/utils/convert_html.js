import React from "react"
import { convertFromHTML, convertToHTML } from "draft-convert"
import {
  removeDisallowedBlocks,
  standardizeSpacing,
  stripGoogleStyles,
  stripH3Tags,
} from "./text_stripping"
import { unescapeHTML } from "underscore.string"

export const convertToRichHtml = (editorState, layout, hasFeatures) => {
  let html = convertToHTML({
    entityToHTML: (entity, originalText) => {
      const { className, url } = entity.data

      if (entity.type === "LINK") {
        const innerText = unescapeHTML(originalText)
        if (hasFeatures && className && className.includes("is-follow-link")) {
          const artist = url.split("/artist/")[1]

          return (
            <span>
              <a href={url} className={className}>
                {innerText}
              </a>
              <a data-id={artist} className="entity-follow artist-follow" />
            </span>
          )
        } else {
          return <a href={url}>{innerText}</a>
        }
      }
      return originalText
    },
    styleToHTML: style => {
      if (style === "STRIKETHROUGH") {
        return <span style={{ textDecoration: "line-through" }} />
      }
    },
  })(editorState.getCurrentContent())
  // put the line breaks back for correct client rendering
  html = standardizeSpacing(html)
  if (layout === "classic") {
    html = stripH3Tags(html)
  }
  // dont save empty sections
  html = html === "<p><br></p>" ? "" : html

  return html
}

export const convertFromRichHtml = html => {
  const blocksFromHTML = convertFromHTML({
    htmlToStyle: (nodeName, node, currentStyle) => {
      if (nodeName === "span" && node.style.textDecoration === "line-through") {
        return currentStyle.add("STRIKETHROUGH")
      } else {
        return currentStyle
      }
    },
    htmlToEntity: (nodeName, node, createEntity) => {
      let data

      if (nodeName === "a") {
        data = {
          url: node.href,
          className: node.classList.toString(),
        }
        return createEntity("LINK", "MUTABLE", data)
      }
      if (nodeName === "p" && node.innerHTML === "<br>") {
        node.innerHTML = "" // remove <br>, it renders extra breaks in editor
      }
    },
  })(html)
  return blocksFromHTML
}

export const getFormattedState = (
  editorState,
  html,
  layout,
  hasFeatures,
  keepAllowed
) => {
  const formattedHTML = stripGoogleStyles(html)
  const blocksFromHTML = convertFromRichHtml(formattedHTML).getBlocksAsArray()
  const newState = removeDisallowedBlocks(
    editorState,
    blocksFromHTML,
    layout,
    hasFeatures,
    keepAllowed
  )
  const newHTML = convertToRichHtml(newState, layout, hasFeatures)

  return {
    editorState: newState,
    html: newHTML,
  }
}
