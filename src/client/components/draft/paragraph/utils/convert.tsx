import { convertFromHTML, convertToHTML } from 'draft-convert'
import {
  ContentState,
  DraftEntityMutability,
  RawDraftContentBlock,
  RawDraftEntity,
} from 'draft-js'
import React from 'react'
import { stripGoogleStyles } from '../../../rich_text/utils/text_stripping'
import { StyleMap, StyleMapNames, StyleName } from './typings'
import { styleNamesFromMap, styleNodesFromMap } from './utils'

/**
 * Helpers for draft-js Paragraph component data conversion
 */

export const draftDefaultStyles = [
  'BOLD',
  'CODE',
  'ITALIC',
  'STRIKETHROUGH',
  'UNDERLINE',
]

/**
 * Convert HTML to Draft ContentState
 */
export const convertHtmlToDraft = (
  html: string,
  hasLinks: boolean,
  allowedStyles: StyleMap
) => {
  let cleanedHtml = stripGoogleStyles(html)
  cleanedHtml = removeEmptyParagraphs(cleanedHtml)

  return convertFromHTML({
    htmlToBlock,
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
  allowedStyles: StyleMap,
  stripLinebreaks: boolean
) => {
  const styles = styleNamesFromMap(allowedStyles)

  const html = convertToHTML({
    entityToHTML,
    styleToHTML: style => styleToHTML(style, styles),
    blockToHTML,
  })(currentContent)

  const formattedHtml = removeEmptyParagraphs(html)

  if (stripLinebreaks) {
    return stripParagraphLinebreaks(formattedHtml)
  } else {
    return formattedHtml
  }
}

/**
 * convert Html elements to Draft blocks
 */
export const htmlToBlock = (nodeName: string, _: HTMLElement) => {
  if (['body', 'ul', 'ol', 'tr'].includes(nodeName)) {
    // Nested elements are empty, wrap their children instead
    return {}
  } else {
    // Return all elements as default block
    return {
      type: 'unstyled',
      element: 'div',
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
  if (nodeName === 'a') {
    const data = { url: node.href }
    return createEntity('LINK', 'MUTABLE', data)
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
  const isBlock = ['body', 'p', 'div'].includes(nodeName)
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
export const styleToHTML = (style: StyleName, allowedStyles: StyleMapNames) => {
  const isAllowed = allowedStyles.includes(style)
  const plainText = { start: '', end: '' }

  switch (style) {
    case 'BOLD':
      return isAllowed ? <b /> : plainText
    case 'ITALIC':
      return isAllowed ? <i /> : plainText
    default:
      return plainText
  }
}

/**
 * convert Draft entities to Html links
 */
export const entityToHTML = (entity: RawDraftEntity, text: string) => {
  if (entity.type === 'LINK') {
    return <a href={entity.data.url}>{text}</a>
  }
  return text
}

/**
 * convert Draft blocks to Html elements
 */
export const blockToHTML = (block: RawDraftContentBlock) => {
  // TODO: Fix type switching from draft-convert to avoid weird if statement
  if (block.type === 'ordered-list-item') {
    return {
      start: '<p>',
      end: '</p>',
      nestStart: '',
      nestEnd: '',
    }
  }
  if (block.type === 'unordered-list-item') {
    return {
      start: '<p>',
      end: '</p>',
      nestStart: '',
      nestEnd: '',
    }
  } else {
    return {
      start: '<p>',
      end: '</p>',
    }
  }
}

/**
 * convert multiple paragraphs into one
 */
export const stripParagraphLinebreaks = (html: string) => {
  return html.replace(/<\/p><p>/g, ' ')
}

/**
 * strip empty paragraphs from html
 */
export const removeEmptyParagraphs = (html: string) => {
  return html
    .replace(/<p><\/p>/g, '')
    .replace(/<p><br \/><\/p>/g, '')
    .replace(/<p><br><\/p>/g, '')
}
