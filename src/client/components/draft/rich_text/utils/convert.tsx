import { convertFromHTML, convertToHTML } from "draft-convert"
import {
  ContentState,
  DraftEntityMutability,
  RawDraftContentBlock,
  RawDraftEntity,
} from "draft-js"
import React from "react"
import { unescapeHTML } from "underscore.string"
import { stripGoogleStyles } from "../../../rich_text/utils/text_stripping"
import {
  blockElementsFromMap,
  blockNamesFromMap,
  draftDefaultStyles,
  styleNamesFromMap,
  styleNodesFromMap,
} from "../../shared/shared"
import { StyleMap, StyleNames } from "../../typings"

/**
 * Helpers for draft-js RichText component data conversion
 */

/**
 * Convert HTML to Draft ContentState
 */
export const convertHtmlToDraft = (
  html: string,
  hasLinks: boolean,
  allowedBlocks: any,
  allowedStyles: StyleMap
) => {
  const cleanedHtml = stripGoogleStyles(html)
  // TODO: REMOVE ILLEGAL LINEBREAKS
  return convertFromHTML({
    htmlToBlock: (nodeName: string, node: HTMLElement) => {
      return htmlToBlock(nodeName, node, allowedBlocks)
    },
    htmlToEntity: hasLinks ? htmlToEntity : undefined,
    // TODO: type currentStyle OrderedSet
    htmlToStyle: (nodeName: string, _: HTMLElement, currentStyle: any) => {
      return htmlToStyle(nodeName, currentStyle, allowedStyles)
    },
  })(cleanedHtml)
}

/**
 * Convert Draft ContentState to HTML
 */
export const convertDraftToHtml = (
  currentContent: ContentState,
  allowedBlocks: any,
  allowedStyles: StyleMap,
  hasFollowButton: boolean = false
) => {
  const styles = styleNamesFromMap(allowedStyles)
  const blocks = blockNamesFromMap(allowedBlocks)

  const html = convertToHTML({
    entityToHTML: (entity, originalText) =>
      entityToHTML(entity, originalText, hasFollowButton),
    styleToHTML: style => styleToHTML(style, styles),
    blockToHTML: block => blockToHTML(block, blocks),
  })(currentContent)

  return html
}

/**
 * convert Html elements to Draft blocks
 */
export const htmlToBlock = (
  nodeName: string,
  node: HTMLElement,
  allowedBlocks: any
) => {
  const blocks = blockElementsFromMap(allowedBlocks)
  const isAllowedBlock = blocks.includes(nodeName)

  if (["body", "ul", "ol", "tr"].includes(nodeName)) {
    // Nested elements are empty, wrap their children instead
    return {}
  } else if (!isAllowedBlock) {
    return {
      type: "unstyled",
      element: "div",
    }
  } else {
    switch (nodeName) {
      case "blockquote": {
        return {
          type: "blockquote",
          element: "blockquote",
        }
      }
      case "h1": {
        return {
          type: "header-one",
          element: "h1",
        }
      }
      case "h2": {
        return {
          type: "header-two",
          element: "h2",
        }
      }
      case "h3": {
        return {
          type: "header-three",
          element: "h3",
        }
      }
      case "li": {
        const parent = node.parentElement
        if (parent && parent.nodeName === "OL") {
          return {
            type: "ordered-list-item",
            element: "li",
          }
        } else {
          return {
            type: "unordered-list-item",
            element: "li",
          }
        }
      }
      default: {
        return {
          type: "unstyled",
          element: "div",
        }
      }
    }
  }
}

/**
 * convert Html links to Draft entities
 */
export const htmlToEntity = (
  nodeName: string,
  node: HTMLLinkElement,
  createEntity: (
    blockType: string,
    isMutable: DraftEntityMutability,
    data: any
  ) => void
) => {
  if (nodeName === "a") {
    const data = {
      url: node.href,
      className: node.classList ? node.classList.toString() : "",
    }

    return createEntity("LINK", "MUTABLE", data)
  }
}

/**
 * convert Html styles to Draft styles
 */
export const htmlToStyle = (
  nodeName: string,
  currentStyle: any, // TODO: type OrderedSet
  allowedStyles: StyleMap
) => {
  const styleNodes = styleNodesFromMap(allowedStyles)
  const styleNames = styleNamesFromMap(allowedStyles)
  const isBlock = ["body", "p", "div"].includes(nodeName)
  const isAllowedNode = styleNodes.includes(nodeName.toUpperCase())

  if (isBlock || isAllowedNode) {
    return currentStyle
  } else {
    // Remove draft default styles unless explicitly allowed
    let style = currentStyle
    draftDefaultStyles.map(draftStyle => {
      const isAllowedStyle = styleNames.includes(draftStyle)
      if (!isAllowedStyle) {
        style = style.remove(draftStyle)
      }
    })
    return style
  }
}

/**
 * convert Draft styles to Html tags
 */
export const styleToHTML = (style: StyleNames, allowedStyles: StyleNames[]) => {
  const isAllowed = allowedStyles.includes(style)
  const plainText = { start: "", end: "" }

  switch (style) {
    case "BOLD":
      return isAllowed ? <b /> : plainText
    case "ITALIC":
      return isAllowed ? <i /> : plainText
    case "UNDERLINE":
      return isAllowed ? <u /> : plainText
    case "STRIKETHROUGH":
      return isAllowed ? <s /> : plainText
    default:
      return plainText
  }
}

/**
 * convert Draft entities to Html links
 */
export const entityToHTML = (
  entity: RawDraftEntity,
  text: string,
  hasFollowButton: boolean
) => {
  if (entity.type === "LINK") {
    const { className, url } = entity.data
    const innerText = unescapeHTML(text)
    const isFollowLink = className && className.includes("is-follow-link")

    if (hasFollowButton && isFollowLink) {
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
      return <a href={entity.data.url}>{innerText}</a>
    }
  }
  return text
}

/**
 * convert Draft blocks to Html elements
 */
export const blockToHTML = (
  block: RawDraftContentBlock,
  allowedBlocks: any
) => {
  const { type } = block
  const isAllowed = allowedBlocks.includes(type)

  if (type === "blockquote" && isAllowed) {
    return {
      start: "<blockquote>",
      end: "</blockquote>",
    }
  }
  if (type === "header-one" && isAllowed) {
    return {
      start: "<h1>",
      end: "</h1>",
    }
  }
  if (type === "header-two" && isAllowed) {
    return {
      start: "<h2>",
      end: "</h2>",
    }
  }
  if (type === "header-three" && isAllowed) {
    return {
      start: "<h3>",
      end: "</h3>",
    }
  }
  if (type === "ordered-list-item" && isAllowed) {
    return {
      start: "<li>",
      end: "</li>",
      nestStart: "<ol>",
      nestEnd: "</ol>",
      nest: "<ol />",
    }
  }
  if (type === "unordered-list-item" && isAllowed) {
    return {
      start: "<li>",
      end: "</li>",
      nestStart: "<ul>",
      nestEnd: "</ul>",
      nest: "<ul />",
    }
  }
  return {
    start: "<p>",
    end: "</p>",
  }
}
