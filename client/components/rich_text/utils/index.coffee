{ KeyBindingUtil,
  getDefaultKeyBinding } = require 'draft-js'

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

exports.keyBindingFn = (e) ->
  if KeyBindingUtil.hasCommandModifier(e)
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
  return getDefaultKeyBinding(e)