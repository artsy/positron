import Immutable from 'immutable'
import {
  ContentEnd,
  findContentEndEntities,
  findLinkEntities,
  Link
} from 'client/components/rich_text/utils/decorators'

export const inlineStyles = (layout) => {
  // for menu display only
  const styles = [
    {label: 'B', name: 'BOLD'},
    {label: 'I', name: 'ITALIC'}
  ]
  if (layout === 'standard') {
    styles.push({label: ' S ', name: 'STRIKETHROUGH'})
  }
  return styles
}

export const blockTypes = (layout, hasFeatures) => {
  // for menu display only
  const blocks = [
    {label: 'H2', name: 'header-two'},
    {label: 'H3', name: 'header-three'},
    {name: 'unordered-list-item'}
  ]
  if (layout === 'feature') {
    blocks.unshift({label: 'H1', name: 'header-one'})
  }
  if (layout === 'classic') {
    blocks.push({name: 'ordered-list-item'})
  }
  if (hasFeatures) {
    blocks.push({name: 'blockquote'})
  }
  return blocks
}

export const blockRenderMap = (layout, hasFeatures) => {
  // declare HTML elements available to the editor
  if (!hasFeatures) {
  // classic, partners
    return Immutable.Map({
      'header-two': {element: 'h2'},
      'header-three': {element: 'h3'},
      'unordered-list-item': {element: 'li'},
      'ordered-list-item': {element: 'li'},
      'unstyled': {element: 'div'}
    })
  }
  if (layout === 'feature') {
    return Immutable.Map({
      'header-one': { element: 'h1' },
      'header-two': {element: 'h2'},
      'header-three': {element: 'h3'},
      'blockquote': {element: 'blockquote'},
      'unordered-list-item': {element: 'li'},
      'ordered-list-item': {element: 'li'},
      'unstyled': {element: 'div'}
    })
  } else {
    // standard, classic on internal channels
    return Immutable.Map({
      'header-two': {element: 'h2'},
      'header-three': {element: 'h3'},
      'blockquote': {element: 'blockquote'},
      'unordered-list-item': {element: 'li'},
      'ordered-list-item': {element: 'li'},
      'unstyled': {element: 'div'}
    })
  }
}

export const decorators = (layout) => {
  const decorators = [
    {
      strategy: findLinkEntities,
      component: Link
    }
  ]
  if (layout !== 'classic') {
    decorators.push({
      strategy: findContentEndEntities,
      component: ContentEnd
    })
  }
  return decorators
}
