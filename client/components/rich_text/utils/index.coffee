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

# SELECTION STATE UTILS
exports.getSelectionDetails = (editorState) ->
  selection = editorState.getSelection()
  anchorOffset = selection.getAnchorOffset()
  anchorKey = selection.getAnchorKey()
  anchorBlock = editorState.getCurrentContent().getBlockForKey(anchorKey)
  anchorType = editorState.getCurrentContent().getBlockForKey(anchorKey).getType()
  beforeKey = editorState.getCurrentContent().getKeyBefore(anchorKey)
  blockBefore = editorState.getCurrentContent().getBlockForKey(beforeKey)
  afterKey = editorState.getCurrentContent().getBlockAfter(anchorKey)?.getKey()
  lastBlock = editorState.getCurrentContent().getLastBlock()
  isFirstCharacter = selection.getStartOffset() is 0
  isLastCharacter = selection.getStartOffset() is anchorBlock.getLength()
  return {
    state: selection
    anchorKey: anchorKey
    anchorType: anchorType
    beforeKey: beforeKey
    afterKey: afterKey
    isFirstBlock: !blockBefore
    isLastBlock: lastBlock.getKey() is anchorKey
    isFirstCharacter: isFirstCharacter
    isLastCharacter: isLastCharacter
    anchorOffset: anchorOffset
  }

exports.setSelectionToStart = (editorState) ->
  # reset the cursor to the first character of the first block
  firstKey = editorState.getCurrentContent().getFirstBlock().getKey()
  newSelection = new SelectionState {
    anchorKey: firstKey
    anchorOffset: 0
    focusKey: firstKey
    focusOffset: 0
  }
  return EditorState.forceSelection editorState, newSelection

exports.getExistingLinkData = (editorState) ->
  # return data of a selected link element
  url = ''
  anchorKey = editorState.getSelection().getStartKey()
  anchorBlock = editorState.getCurrentContent().getBlockForKey(anchorKey)
  linkKey = anchorBlock?.getEntityAt(editorState.getSelection().getStartOffset())
  if linkKey
    linkInstance = editorState.getCurrentContent().getEntity(linkKey)
    url = linkInstance.getData().url
    className = linkInstance.getData().className or ''
  return { url: url, key: linkKey, className: className }

exports.stickyControlsBox = (location, fromTop, fromLeft) ->
  # use exported selection here instead of passing location
  top = location.target.top - location.parent.top + fromTop
  left = location.target.left - location.parent.left + (location.target.width / 2) - fromLeft
  return {top: top, left: left}

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
