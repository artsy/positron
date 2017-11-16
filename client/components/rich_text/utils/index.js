export const stripGoogleStyles = (html) => {
  // Applied on paste, removes dummy styles inserted by google docs

  // 1. Remove non-breaking spaces between paragraphs
  const strippedHtml = html
    .replace(/<\/p><br>/g, '</p>')
    .replace('<br class="Apple-interchange-newline">', '')

  // Setup HTML inside queryable container
  const doc = document.createElement('div')
  doc.innerHTML = strippedHtml || ''

  // 2. Remove dummy <b> tags google docs wraps document in
  const boldBlocks = doc.getElementsByTagName('B')
  for (let i in boldBlocks) {
    let block = boldBlocks[i]
    const { style } = block
    if (style && style.fontWeight === 'normal') {
      $(doc.getElementsByTagName('B')[i]).replaceWith(block.innerHTML)
    }
  }

  // 3. Replace bold/italic spans with actual strong/em tags
  const spanBlocks = doc.getElementsByTagName('SPAN')
  for (let i in spanBlocks) {
    let block = spanBlocks[i]
    const { style } = block
    const isItalic = style && style.fontStyle === 'italic'
    const isBold = style && style.fontWeight === '700'

    if (isItalic && isBold) {
      block = '<span><strong><em>' + block.innerHTML + '</em></strong></span>'
    } else if (isItalic) {
      block = '<span><em>' + block.innerHTML + '</em></span>'
    } else if (isBold) {
      block = '<span><strong>' + block.innerHTML + '</strong></span>'
    }
    $(doc.getElementsByTagName('SPAN')[i]).replaceWith(block)
  }
  debugger
  return doc.innerHTML
}

// React = require 'react'
// ReactDOM = require 'react-dom'
// { EditorState,
//   Entity,
//   getDefaultKeyBinding,
//   KeyBindingUtil,
//   SelectionState } = require 'draft-js'
// { convertFromHTML, convertToHTML } = require 'draft-convert'
// { a, span, h3 } = React.DOM

// # SELECTION STATE UTILS
// exports.getSelectionDetails = (editorState) ->
//   selection = editorState.getSelection()
//   anchorOffset = selection.getAnchorOffset()
//   anchorKey = selection.getAnchorKey()
//   anchorBlock = editorState.getCurrentContent().getBlockForKey(anchorKey)
//   anchorType = editorState.getCurrentContent().getBlockForKey(anchorKey).getType()
//   beforeKey = editorState.getCurrentContent().getKeyBefore(anchorKey)
//   blockBefore = editorState.getCurrentContent().getBlockForKey(beforeKey)
//   afterKey = editorState.getCurrentContent().getBlockAfter(anchorKey)?.getKey()
//   lastBlock = editorState.getCurrentContent().getLastBlock()
//   isFirstCharacter = selection.getStartOffset() is 0
//   isLastCharacter = selection.getStartOffset() is anchorBlock.getLength()
//   return {
//     state: selection
//     anchorKey: anchorKey
//     anchorType: anchorType
//     beforeKey: beforeKey
//     afterKey: afterKey
//     isFirstBlock: !blockBefore
//     isLastBlock: lastBlock.getKey() is anchorKey
//     isFirstCharacter: isFirstCharacter
//     isLastCharacter: isLastCharacter
//     anchorOffset: anchorOffset
//   }

// exports.moveSelection = (editorState, selection, direction, shift) ->
//   # draft has no fallback for interrupted r/l arrow keys
//   # here cursor is manually forced r/l within a block,
//   # or to the beginning or end of an adjacent block
//   anchorKey = selection.anchorKey
//   offset = selection.anchorOffset + direction
//   if selection.isFirstCharacter and direction is -1
//     anchorKey = selection.beforeKey
//     offset = editorState.getCurrentContent().getBlockForKey(anchorKey).getLength()
//   else if selection.isLastCharacter and direction is 1
//     anchorKey = selection.afterKey
//     offset = 0
//   else if shift
//     # manually highlight text if shift key is down
//     offset = selection.anchorOffset
//     focusOffset = selection.state.getEndOffset() + direction
//   newSelection = new SelectionState {
//     anchorKey: anchorKey
//     anchorOffset: offset
//     focusKey: anchorKey
//     focusOffset: focusOffset or offset
//     hasFocus: true
//   }
//   return EditorState.forceSelection editorState, newSelection

// exports.getSelectionLocation = ($parent) ->
//   # get x/y location of currently selected text
//   selection = window.getSelection().getRangeAt(0).getClientRects()
//   if selection[0].width is 0
//     target = selection[1]
//   else
//     target = selection[0]
//   parent = {
//     top: $parent.top - window.pageYOffset
//     left: $parent.left
//   }
//   return { target: target, parent: parent }

// exports.setSelectionToStart = (editorState) ->
//   # reset the cursor to the first character of the first block
//   firstKey = editorState.getCurrentContent().getFirstBlock().getKey()
//   newSelection = new SelectionState {
//     anchorKey: firstKey
//     anchorOffset: 0
//     focusKey: firstKey
//     focusOffset: 0
//   }
//   return EditorState.forceSelection editorState, newSelection

// exports.getExistingLinkData = (editorState) ->
//   # return data of a selected link element
//   url = ''
//   anchorKey = editorState.getSelection().getStartKey()
//   anchorBlock = editorState.getCurrentContent().getBlockForKey(anchorKey)
//   linkKey = anchorBlock?.getEntityAt(editorState.getSelection().getStartOffset())
//   if linkKey
//     linkInstance = editorState.getCurrentContent().getEntity(linkKey)
//     url = linkInstance.getData().url
//     className = linkInstance.getData().className or ''
//   return { url: url, key: linkKey, className: className }

// exports.stickyControlsBox = (location, fromTop, fromLeft) ->
//   # use exported selection here instead of passing location
//   top = location.target.top - location.parent.top + fromTop
//   left = location.target.left - location.parent.left + (location.target.width / 2) - fromLeft
//   return {top: top, left: left}

// # IMPORT / EXPORT HTML
// exports.convertToRichHtml = (editorState, layout) ->
//   html = convertToHTML({
//     entityToHTML: (entity, originalText) ->
//       if entity.type is 'LINK'
//         if entity.data.className?.includes('is-follow-link')
//           artist = entity.data.url.split('/artist/')[1]
//           return '<a href="' + entity.data.url + '" class="' + entity.data.className + '">' + originalText +
//            '</a><a data-id="'+ artist + '" class="entity-follow artist-follow"></a>'
//         else
//           return a { href: entity.data.url}
//       if entity.type is 'CONTENT-START' or entity.type is 'CONTENT-END'
//         return '<span class="' + entity.data.className + '">' + originalText + '</span>'
//       return originalText
//     styleToHTML: (style) ->
//       if style is 'STRIKETHROUGH'
//         return span { style: {textDecoration: 'line-through'}}
//   })(editorState.getCurrentContent())
//   # put the line breaks back for correct client rendering
//   html = exports.standardizeSpacing html
//   html = exports.stripH3Tags(html) if layout is 'classic'
//   html = if html is '<p><br></p>' then '' else html
//   return html

// exports.convertFromRichHtml = (html) ->
//   blocksFromHTML = convertFromHTML({
//     htmlToStyle: (nodeName, node, currentStyle) ->
//       if nodeName is 'span' and node.style.textDecoration is 'line-through'
//         return currentStyle.add 'STRIKETHROUGH'
//       else
//         return currentStyle
//     htmlToEntity: (nodeName, node) ->
//       if nodeName is 'a'
//         data = {url: node.href, className: node.classList.toString()}
//         return Entity.create(
//             'LINK',
//             'MUTABLE',
//             data
//         )
//       if nodeName is 'p' and node.innerHTML is '<br>'
//         node.innerHTML = '' # remove <br>, it renders extra breaks in editor
//       if nodeName is 'span' and node.classList.length
//         data = {className: node.classList.toString()}
//         spanType = if data.className is 'content-start' then 'CONTENT-START' else 'CONTENT-END'
//         return Entity.create(
//             spanType,
//             'MUTABLE',
//             data
//         )
//     })(html)
//   return blocksFromHTML

// exports.stripCharacterStyles = (contentBlock, keepAllowed) ->
//   characterList = contentBlock.getCharacterList().map (character) ->
//     if keepAllowed
//       unless character.hasStyle 'UNDERLINE'
//         return character if character.hasStyle('BOLD') or character.hasStyle('ITALIC') or character.hasStyle('STRIKETHROUGH')
//     character.set 'style', character.get('style').clear()
//   unstyled = contentBlock.set 'characterList', characterList
//   return unstyled

// exports.stripH3Tags = (html) ->
//   # replace style tags insize h3 for classic layouts
//   doc = document.createElement('div')
//   doc.innerHTML = html
//   h3s = doc.getElementsByTagName('h3')
//   for h3, i in h3s
//     innerH3 = doc.getElementsByTagName('h3')[i].innerHTML
//       .replace(/<em>/g, '')
//       .replace(/<\/\em>/g, '')
//       .replace(/<strong>/g, '')
//       .replace(/<\/\strong>/g, '')
//     newH3 = '<h3>' + innerH3 + '</h3>'
//     $(doc.getElementsByTagName('h3')[i]).replaceWith(newH3)
//   return doc.innerHTML

// exports.standardizeSpacing = (html) ->
//   html = html
//     .replace(/<br>/g, '')
//     .replace(/<span><\/span>/g, '')
//     .replace(/<h2><\/h2>/g, '<p><br></p>')
//     .replace(/<h3><\/h3>/g, '<p><br></p>')
//     .replace(/<p><\/p><p><\/p>/g, '<p><br></p>')
//     .replace(/<p><\/p>/g, '<p><br></p>')
//     .replace(/<p> <\/p>/g, '<p><br></p>')
//     .replace(/<p><br><\/p><p><br><\/p>/g, '<p><br></p>')
//     .replace(/  /g, ' &nbsp;')
//   return html

// # EDITORIAL CUSTOM TEXT ENTITIES
// exports.setContentStartEnd = (html, layout, isStartText, isEndText) ->
//   doc = document.createElement('div')
//   doc.innerHTML = html
//   doc = exports.setDropCap(doc, isStartText) if layout is 'feature'
//   doc = exports.setContentEndMarker doc, isEndText
//   return doc.innerHTML

// exports.setDropCap = (doc, isStartText) ->
//   innerSpan = doc.getElementsByClassName('content-start')[0]?.innerHTML
//   newSpan = innerSpan
//   $(doc.getElementsByClassName('content-start')[0]).replaceWith(newSpan) if newSpan
//   if isStartText
//     oldHtml = $(doc).find("p:first").html()
//     if oldHtml
//       firstLetter = '<span class="content-start">' + oldHtml.substring(0, 1) + '</span>'
//       afterFirst = oldHtml.substring(1, oldHtml.length)
//       newHtml = firstLetter + afterFirst
//       $(doc).find("p:first").html(newHtml)
//   return doc

// exports.setContentEndMarker = (doc, isEndText) ->
//   innerSpan = doc.getElementsByClassName('content-end')[0]?.innerHTML
//   $(doc.getElementsByClassName('content-end')[0]).replaceWith('')
//   if isEndText
//     oldHtml = $(doc).children().last().html()
//     newHtml = oldHtml + '<span class="content-end"> </span>'
//     $(doc).children().last().html(newHtml)
//   return doc
