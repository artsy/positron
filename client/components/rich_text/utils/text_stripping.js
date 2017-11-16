export const standardizeSpacing = (html) => {
  html = html
    .replace(/<br>/g, '')
    .replace(/<span><\/span>/g, '')
    .replace(/<h2><\/h2>/g, '<p><br></p>')
    .replace(/<h3><\/h3>/g, '<p><br></p>')
    .replace(/<p><\/p><p><\/p>/g, '<p><br></p>')
    .replace(/<p><\/p>/g, '<p><br></p>')
    .replace(/<p> <\/p>/g, '<p><br></p>')
    .replace(/<p><br><\/p><p><br><\/p>/g, '<p><br></p>')
    .replace(/  /g, ' &nbsp;')
  return html
}

export const stripCharacterStyles = (contentBlock, keepAllowed) => {
  // TODO - use selection, not content block
  const characterList = contentBlock.getCharacterList().map((character) => {
    if (keepAllowed && !character.hasStyle('UNDERLINE')) {
      // if keepAllowed (used on paste)
      // strip only styles not allowed in editor
      if (
        character.hasStyle('BOLD') ||
        character.hasStyle('ITALIC') ||
        character.hasStyle('STRIKETHROUGH')
      ) {
        return character
      }
    }
    return character.set('style', character.get('style').clear())
  })
  return contentBlock.set('characterList', characterList)
}

export const stripH3Tags = (html) => {
  // replace style tags inside h3 for classic layouts
  const doc = document.createElement('div')
  doc.innerHTML = html
  const h3s = doc.getElementsByTagName('h3')
  for (let i = 0; i < h3s.length; i++) {
    const innerH3 = doc.getElementsByTagName('h3')[i].innerHTML
      .replace(/<em>/g, '')
      .replace(/<\/em>/g, '')
      .replace(/<strong>/g, '')
      .replace(/<\/strong>/g, '')
    const newH3 = `<h3>${innerH3}</h3>`
    $(doc.getElementsByTagName('h3')[i]).replaceWith(newH3)
  }
  return doc.innerHTML
}

const replaceGoogleFalseTags = (html) => {
  let doc = document.createElement('div')
  doc.innerHTML = html

  var spanBlocks = Array.from(doc.getElementsByTagName('SPAN'))

  spanBlocks.map((block, i) => {
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
  })
  return doc.innerHTML
}

const removeGoogleFalseBoldTags = (html) => {
  let doc = document.createElement('div')
  doc.innerHTML = html

  var boldBlocks = Array.from(doc.getElementsByTagName('B'))

  boldBlocks.map((block, i) => {
    const { style } = block

    if (style && style.fontWeight === 'normal') {
      $(doc.getElementsByTagName('B')[i]).replaceWith(block.innerHTML)
    }
  })
  return doc.innerHTML
}

export const stripGoogleStyles = (html) => {
  // Applied on paste
  // 1. Remove non-breaking spaces between paragraphs
  let strippedHtml = html
    .replace(/<\/p><br>/g, '</p>')
    .replace('<br class="Apple-interchange-newline">', '')

  // 2. Remove dummy <b> tags google docs wraps document in
  strippedHtml = removeGoogleFalseBoldTags(strippedHtml)

  // 3. Replace bold/italic spans with actual strong/em tags
  strippedHtml = replaceGoogleFalseTags(strippedHtml)

  return strippedHtml
}
