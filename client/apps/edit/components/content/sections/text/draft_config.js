import Immutable from 'immutable'
import { CompositeDecorator, EditorState } from 'draft-js'
import { getFormattedState } from 'client/components/rich_text/utils/convert_html'
import { setSelectionToStart } from 'client/components/rich_text/utils/text_selection'
import {
  ContentEnd,
  findContentEndEntities,
  findLinkEntities,
  Link,
  setContentEnd
} from 'client/components/rich_text/utils/decorators'

export const inlineStyles = (layout) => {
  // styles available on menu display
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
  // blocks available on menu display
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

export const blockRenderMapArray = (layout, hasFeatures) => {
  // Get an array of blocks allowed by the editor
  const blockMap = blockRenderMap(layout, hasFeatures)
  const available = Object.keys(blockMap.toObject())

  return Array.from(available)
}

export const decorators = (layout) => {
  // Return custom text entities based on layout
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

export const composedDecorator = (layout) => {
  return new CompositeDecorator(
    decorators(layout)
  )
}

export const setEditorStateFromProps = (props) => {
  // Create a new state and formatted html based on props
  // Converts html blocks to those allowed based on layout
  // strips disallowed classes/blocks, and adds/removes end markers
  const {
    article,
    editing,
    hasFeatures,
    isContentEnd,
    section
  } = props

  const decorators = composedDecorator(article.layout)
  const emptyState = EditorState.createEmpty(decorators)
  const hasContentEnd = isContentEnd && article.layout !== 'classic'
  let editorState

  const formattedData = getFormattedState(emptyState, section.body, article.layout, hasFeatures)
  const html = setContentEnd(formattedData.html, hasContentEnd)

  if (editing) {
    editorState = setSelectionToStart(formattedData.editorState)
  } else {
    editorState = formattedData.editorState
  }
  return { editorState, html }
}

export const getRichElements = (layout, hasFeatures) => {
  // Find the correct blocks, styles allowed in the editor
  const blocks = blockTypes(layout, hasFeatures)
  const blockMap = blockRenderMap(layout, hasFeatures)
  const decorators = composedDecorator(layout)
  const styles = inlineStyles(layout, hasFeatures)

  return {
    blocks,
    blockMap,
    decorators,
    styles
  }
}
