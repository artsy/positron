React = require 'react'
ReactDOM = require 'react-dom'
{ EditorState,
  Entity,
  getDefaultKeyBinding,
  KeyBindingUtil,
  SelectionState } = require 'draft-js'
{ convertFromHTML, convertToHTML } = require 'draft-convert'
{ a, span, h3 } = React.DOM

# CUSTOM KEY BINDINGS
exports.stripGoogleStyles = (html) ->
  # remove non-breaking spaces between paragraphs
  html = html.replace(/<\/\p><br>/g, '</p>').replace('<br class="Apple-interchange-newline">', '')
  doc = document.createElement('div')
  doc.innerHTML = html
  # remove dummy b tags google docs wraps document in
  boldBlocks = doc.getElementsByTagName('B')
  for block, i in boldBlocks
    if block.style.fontWeight is 'normal'
      $(doc.getElementsByTagName('B')[i]).replaceWith(doc.getElementsByTagName('B')[i].innerHTML)
  # replace bold and italic spans with actual strong or em tags
  spans = doc.getElementsByTagName('SPAN')
  for span, i in spans
    newSpan = span
    if span?.style.fontStyle is 'italic' and span?.style.fontWeight is '700'
      newSpan = '<span><strong><em>' + span.innerHTML + '</em></strong></span>'
    else if span?.style.fontStyle is 'italic'
      newSpan = '<span><em>' + span.innerHTML + '</em></span>'
    else if span?.style.fontWeight is '700'
      newSpan = '<span><strong>' + span.innerHTML + '</strong></span>'
    $(doc.getElementsByTagName('SPAN')[i]).replaceWith(newSpan)
  return doc.innerHTML

exports.keyBindingFnFull = (e) ->
  if KeyBindingUtil.hasCommandModifier(e)
    if e.keyCode is 49   # command + 1
      return 'header-one'
    if e.keyCode is 50   # command + 2
      return 'header-two'
    if e.keyCode is 51   # command + 3
      return 'header-three'
    if e.keyCode is 191  # command + /
      return 'custom-clear'
    if e.keyCode is 55   # command + 7
      return 'ordered-list-item'
    if e.keyCode is 56   # command + 8
      return 'unordered-list-item'
    if e.keyCode is 75   # command + K
      return 'link-prompt'
    if e.keyCode is 219   # command + [
      return 'blockquote'
  if e.keyCode is 37 or e.keyCode is 39 # l/r arrows: no fallback so pass full e
    return e
  return getDefaultKeyBinding(e)

exports.keyBindingFnCaption = (e) ->
  if KeyBindingUtil.hasCommandModifier(e)
    if e.keyCode is 75   # command + K
      return 'link-prompt'
  return getDefaultKeyBinding(e)


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

exports.moveSelection = (editorState, selection, direction) ->
  # draft has no fallback for interrupted r/l arrow keys
  # here cursor is manually forced r/l within a block,
  # or to the beginning or end of an adjacent block
  anchorKey = selection.anchorKey
  offset = selection.anchorOffset + direction
  if selection.isFirstCharacter and direction is -1
    anchorKey = selection.beforeKey
    offset = editorState.getCurrentContent().getBlockForKey(anchorKey).getLength()
  if selection.isLastCharacter and direction is 1
    anchorKey = selection.afterKey
    offset = 0
  newSelection = new SelectionState {
    anchorKey: anchorKey
    anchorOffset: offset
    focusKey: anchorKey
    focusOffset: offset
  }
  return EditorState.forceSelection editorState, newSelection

exports.getSelectionLocation = ($parent) ->
  # get x/y location of currently selected text
  selection = window.getSelection().getRangeAt(0).getClientRects()
  if selection[0].width is 0
    target = selection[1]
  else
    target = selection[0]
  parent = {
    top: $parent.top - window.pageYOffset
    left: $parent.left
  }
  return { target: target, parent: parent }

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
  top = location.target.top - location.parent.top + fromTop
  left = location.target.left - location.parent.left + (location.target.width / 2) - fromLeft
  return {top: top, left: left}

# IMPORT / EXPORT HTML
exports.convertToRichHtml = (editorState) ->
  html = convertToHTML({
    entityToHTML: (entity, originalText) ->
      if entity.type is 'LINK'
        sanitizeName = originalText.split(' ')[0].replace(/[.,\/#!$%\^&\*;:{}=\_`’'~()]/g,"")
        name = if entity.data.name then ' name="' + sanitizeName + '"' else ''
        if entity.data.className?.includes('is-follow-link')
          artist = entity.data.url.split('/artist/')[1]
          return '<a href="' + entity.data.url + '" class="' + entity.data.className + '"' + name + '>' + originalText +
           '</a><a data-id="'+ artist + '" class="entity-follow artist-follow"></a>'
        else if entity.data.className is 'is-jump-link'
          return a { name: sanitizeName, className: entity.data.className}
        else
          return a { href: entity.data.url}
      return originalText
    blockToHTML: (block) ->
      if block.type is 'header-three'
        return h3 {}, block.text
    styleToHTML: (style) ->
      if style is 'STRIKETHROUGH'
        return span { style: {textDecoration: 'line-through'}}
  })(editorState.getCurrentContent())
  # put the line breaks back for correct client rendering
  html = exports.standardizeSpacing html
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
        data = {url: node.href, name: node.name, className: node.classList.toString()}
        return Entity.create(
            'LINK',
            'MUTABLE',
            data
        )
      if nodeName is 'p' and node.innerHTML is '<br>'
        node.innerHTML = '' # remove <br>, it renders extra breaks in editor
    })(html)
  return blocksFromHTML

exports.standardizeSpacing = (html) ->
  html = html
    .replace(/<h2><\/\h2>/g, '<p><br></p>')
    .replace(/<h3><\/\h3>/g, '<p><br></p>')
    .replace(/<p><\/\p><p><\/\p>/g, '<p><br></p>')
    .replace(/<p><\/\p>/g, '<p><br></p>')
    .replace(/<p> <\/\p>/g, '<p><br></p>')
    .replace(/<p><br><\/\p><p><br><\/\p>/g, '<p><br></p>')
    .replace(/  /g, ' &nbsp;')
  return html
