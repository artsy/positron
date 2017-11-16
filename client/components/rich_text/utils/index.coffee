React = require 'react'
ReactDOM = require 'react-dom'
{ EditorState,
  Entity,
  getDefaultKeyBinding,
  KeyBindingUtil,
  SelectionState } = require 'draft-js'
{ convertFromHTML, convertToHTML } = require 'draft-convert'
{ a, span, h3 } = React.DOM
{ standardizeSpacing, stripH3Tags } = require './text_stripping.js'

# IMPORT / EXPORT HTML
exports.convertToRichHtml = (editorState, layout) ->
  html = convertToHTML({
    entityToHTML: (entity, originalText) ->
      if entity.type is 'LINK'
        if entity.data.className?.includes('is-follow-link')
          artist = entity.data.url.split('/artist/')[1]
          return '<a href="' + entity.data.url + '" class="' + entity.data.className + '">' + originalText +
           '</a><a data-id="'+ artist + '" class="entity-follow artist-follow"></a>'
        else
          return a { href: entity.data.url}
      if entity.type is 'CONTENT-END'
        return '<span class="' + entity.data.className + '">' + originalText + '</span>'
      return originalText
    styleToHTML: (style) ->
      if style is 'STRIKETHROUGH'
        return span { style: {textDecoration: 'line-through'}}
  })(editorState.getCurrentContent())
  # put the line breaks back for correct client rendering
  html = standardizeSpacing html
  html = stripH3Tags(html) if layout is 'classic'
  html = if html is '<p><br></p>' then '' else html
  return html

exports.convertFromRichHtml = (html) ->
  blocksFromHTML = convertFromHTML({
    htmlToStyle: (nodeName, node, currentStyle) ->
      if nodeName is 'span' and node.style.textDecoration is 'line-through'
        return currentStyle.add 'STRIKETHROUGH'
      else
        return currentStyle
    htmlToEntity: (nodeName, node) ->
      if nodeName is 'a'
        data = {url: node.href, className: node.classList.toString()}
        return Entity.create(
            'LINK',
            'MUTABLE',
            data
        )
      if nodeName is 'p' and node.innerHTML is '<br>'
        node.innerHTML = '' # remove <br>, it renders extra breaks in editor
      if nodeName is 'span' and node.classList.length
        data = {className: node.classList.toString()}
        spanType = 'CONTENT-END' if data.className is 'content-end'
        return Entity.create(
            spanType,
            'MUTABLE',
            data
        )
    })(html)
  return blocksFromHTML

# EDITORIAL CUSTOM TEXT ENTITIES
exports.setContentStartEnd = (html, layout, isStartText, isEndText) ->
  doc = document.createElement('div')
  doc.innerHTML = html
  doc = exports.setContentEndMarker doc, isEndText
  return doc.innerHTML

exports.setContentEndMarker = (doc, isEndText) ->
  innerSpan = doc.getElementsByClassName('content-end')[0]?.innerHTML
  $(doc.getElementsByClassName('content-end')[0]).replaceWith('')
  if isEndText
    oldHtml = $(doc).children().last().html()
    newHtml = oldHtml + '<span class="content-end"> </span>'
    $(doc).children().last().html(newHtml)
  return doc
