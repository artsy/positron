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
