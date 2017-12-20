import React from 'react'
import { convertFromHTML, convertToHTML } from 'draft-convert'
import { standardizeSpacing, stripH3Tags } from './text_stripping'
import { unescapeHTML } from 'underscore.string'

export const convertToRichHtml = (editorState, layout) => {
  let html = convertToHTML({
    entityToHTML: (entity, originalText) => {
      const { className, url } = entity.data

      if (entity.type === 'LINK') {
        const innerText = unescapeHTML(originalText)

        if (className && className.includes('is-follow-link')) {
          const artist = url.split('/artist/')[1]

          return (
            <span>
              <a href={url} className={className}>
                {innerText}
              </a>
              <a data-id={artist} className='entity-follow artist-follow' />
            </span>
          )
        } else {
          return <a href={url}>{innerText}</a>
        }
      }

      if (entity.type === 'CONTENT-END') {
        return <span className={className}>{originalText}</span>
      }

      return originalText
    },
    styleToHTML: (style) => {
      if (style === 'STRIKETHROUGH') {
        return (
          <span style={{ textDecoration: 'line-through' }} />
        )
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
