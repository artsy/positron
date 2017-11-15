import Immutable from 'immutable'
import Decorators from './decorators.js'

export const blockRenderMap = () => {
  return Immutable.Map({
    'unstyled': {element: 'p'}
  })
}

export const inlineStyles = (type) => {
  // for menu display only
  let styles = []
  if (type !== 'postscript') {
    styles.push({label: 'I', name: 'ITALIC'})
  }
  if (type !== 'caption') {
    styles.push({label: 'B', name: 'BOLD'})
  }
  return styles
}

export const decorators = (linked) => {
  let decorators = []
  if (linked) {
    decorators.push({
      strategy: Decorators.findLinkEntities,
      component: Decorators.Link
    })
  }
  return decorators
}
