import React from 'react'
import { convertFromHTML, convertToHTML } from 'draft-convert'
import { Entity } from 'draft-js'
import { standardizeSpacing, stripH3Tags } from './text_stripping.js'

export const convertToRichHtml = (editorState, layout) => {
  let html = convertToHTML({
    entityToHTML: (entity, originalText) => {
      if (entity.type === 'LINK') {
        if (entity.data.className != null
          ? entity.data.className.includes('is-follow-link')
          : undefined
        ) {
          const artist = entity.data.url.split('/artist/')[1]
          return (
            <span>
              <a href={entity.data.url} className={entity.data.className}>
                {originalText}
              </a>
              <a data-id={artist} className='entity-follow artist-follow' />
            </span>
          )
        } else {
          return <a href={entity.data.url}>{originalText}</a>
        }
      }
      if (entity.type === 'CONTENT-END') {
        return <span className={entity.data.className}>{originalText}</span>
      }
      return originalText
    },
    styleToHTML: (style) => {
      if (style === 'STRIKETHROUGH') {
        return <span style={{ textDecoration: 'line-through' }} />
      }
    }
  })(editorState.getCurrentContent())
  // put the line breaks back for correct client rendering
  html = standardizeSpacing(html)
  if (layout === 'classic') {
    html = stripH3Tags(html)
  }
  // dont save empty sections
  html = html === '<p><br></p>' ? '' : html
  return html
}

export const convertFromRichHtml = (html) => {
  const blocksFromHTML = convertFromHTML({
    htmlToStyle: (nodeName, node, currentStyle) => {
      if ((nodeName === 'span') && (node.style.textDecoration === 'line-through')) {
        return currentStyle.add('STRIKETHROUGH')
      } else {
        return currentStyle
      }
    },
    htmlToEntity: (nodeName, node, createEntity) => {
      let data
      if (nodeName === 'a') {
        data = {
          url: node.href,
          className: node.classList.toString()
        }
        return createEntity(
          'LINK',
          'MUTABLE',
          data
        )
      }
      if ((nodeName === 'p') && (node.innerHTML === '<br>')) {
        node.innerHTML = '' // remove <br>, it renders extra breaks in editor
      }
      if ((nodeName === 'span') && node.classList.length) {
        let spanType
        data = { className: node.classList.toString() }
        if (data.className === 'content-end') {
          spanType = 'CONTENT-END'
        }
        return createEntity(
          spanType,
          'MUTABLE',
          data
        )
      }
    }
  })(html)
  return blocksFromHTML
}
