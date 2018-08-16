import React from 'react'
import { convertFromHTML, convertToHTML } from 'draft-convert'
import { stripGoogleStyles } from 'client/components/rich_text/utils/text_stripping'
import { styleNamesFromMap, styleNodesFromMap } from './utils'

/**
 * Helpers for draft-js Paragraph component data conversion
*/

export const draftDefaultStyles = [
  'BOLD',
  'CODE',
  'ITALIC',
  'STRIKETHROUGH',
  'UNDERLINE'
]

export const convertHtmlToDraft = (html, hasLinks, allowedStyles) => {
  /**
   * Convert HTML to Draft ContentState
   */
  let cleanedHtml = stripGoogleStyles(html)

  return convertFromHTML({
    htmlToBlock,
    htmlToEntity: hasLinks ? htmlToEntity : undefined,
    htmlToStyle: (nodeName, node, currentStyle) => {
      return htmlToStyle(nodeName, node, currentStyle, allowedStyles)
    }
  })(cleanedHtml)
}

export const convertDraftToHtml = (currentContent, allowedStyles, stripLinebreaks) => {
  /**
   * Convert Draft ContentState to HTML
   */
  const styles = styleNamesFromMap(allowedStyles)

  const html = convertToHTML({
    entityToHTML,
    styleToHTML: style => styleToHTML(style, styles),
    blockToHTML
  })(currentContent)

  if (stripLinebreaks) {
    return stripParagraphLinebreaks(html)
  } else {
    return html
  }
}

/**
 * convertHtmlToDraft helpers
 */
export const htmlToBlock = (nodeName, node) => {
  if (['body', 'ul', 'ol', 'tr'].includes(nodeName)) {
    // Nested elements are empty, wrap their children instead
    return {}
  } else {
    // Return all elements as default block
    return {
      type: 'unstyled',
      element: 'div'
    }
  }
}

export const htmlToEntity = (nodeName, node, createEntity) => {
  if (nodeName === 'a') {
    const data = { url: node.href }
    return createEntity(
      'LINK',
      'MUTABLE',
      data
    )
  }
}

export const htmlToStyle = (nodeName, node, currentStyle, allowedStyles) => {
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
 * convertDraftToHtml helpers
 */

export const styleToHTML = (style, allowedStyles) => {
  const isAllowed = allowedStyles.includes(style)
  const plainText = {start: '', end: ''}

  switch (style) {
    case 'BOLD':
      return isAllowed ? <b /> : plainText
    case 'ITALIC':
      return isAllowed ? <i /> : plainText
    default:
      return plainText
  }
}

export const entityToHTML = (entity, text) => {
  if (entity.type === 'LINK') {
    return <a href={entity.data.url}>{text}</a>
  }
  return text
}

export const blockToHTML = block => {
  // TODO: Fix type switching from draft-convert to avoid weird if statement
  if (block.type === 'ordered-list-item') {
    return {
      start: '<p>',
      end: '</p>',
      nestStart: '',
      nestEnd: ''
    }
  }
  if (block.type === 'unordered-list-item') {
    return {
      start: '<p>',
      end: '</p>',
      nestStart: '',
      nestEnd: ''
    }
  } else {
    return {
      start: '<p>',
      end: '</p>'
    }
  }
}

export const stripParagraphLinebreaks = html => {
  return html.replace(/<\/p><p>/g, ' ')
}
