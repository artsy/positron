import Immutable from "immutable"
import { CompositeDecorator, EditorState } from "draft-js"
import { getFormattedState } from "client/components/rich_text/utils/convert_html"
import { setSelectionToStart } from "client/components/rich_text/utils/text_selection"
import {
  findLinkEntities,
  Link,
  setContentEnd,
} from "client/components/rich_text/utils/decorators"

export const inlineStyles = layout => {
  // styles available on menu display
  const styles = [{ label: "B", name: "BOLD" }, { label: "I", name: "ITALIC" }]
  if (["standard", "news"].includes(layout)) {
    styles.push({ label: " S ", name: "STRIKETHROUGH" })
  }
  return styles
}

export const blockTypes = (layout, hasFeatures) => {
  // blocks available in pop-up menu
  switch (layout) {
    case "classic": {
      if (!hasFeatures) {
        return [
          { label: "H2", name: "header-two" },
          { label: "H3", name: "header-three" },
          { name: "ordered-list-item" },
          { name: "unordered-list-item" },
        ]
      } else {
        return [
          { label: "H2", name: "header-two" },
          { label: "H3", name: "header-three" },
          { name: "ordered-list-item" },
          { name: "unordered-list-item" },
          { name: "blockquote" },
        ]
      }
    }
    case "feature": {
      return [
        { label: "H1", name: "header-one" },
        { label: "H2", name: "header-two" },
        { label: "H3", name: "header-three" },
        { name: "unordered-list-item" },
        { name: "blockquote" },
      ]
    }
    case "news": {
      return [
        { label: "H3", name: "header-three" },
        { name: "ordered-list-item" },
        { name: "unordered-list-item" },
        { name: "blockquote" },
      ]
    }
    default: {
      return [
        { label: "H2", name: "header-two" },
        { label: "H3", name: "header-three" },
        { name: "unordered-list-item" },
        { name: "blockquote" },
      ]
    }
  }
}

export const blockRenderMap = (layout, hasFeatures) => {
  // declare HTML elements available to the editor
  if (!hasFeatures) {
    // classic, partners
    return Immutable.Map({
      "header-two": { element: "h2" },
      "header-three": { element: "h3" },
      "unordered-list-item": { element: "li" },
      "ordered-list-item": { element: "li" },
      unstyled: { element: "div" },
    })
  } else {
    switch (layout) {
      case "feature": {
        return Immutable.Map({
          "header-one": { element: "h1" },
          "header-two": { element: "h2" },
          "header-three": { element: "h3" },
          blockquote: { element: "blockquote" },
          "unordered-list-item": { element: "li" },
          "ordered-list-item": { element: "li" },
          unstyled: { element: "div" },
        })
      }
      case "news": {
        return Immutable.Map({
          "header-three": { element: "h3" },
          "unordered-list-item": { element: "li" },
          "ordered-list-item": { element: "li" },
          blockquote: { element: "blockquote" },
          unstyled: { element: "div" },
        })
      }
      default: {
        // standard, classic on internal channels
        return Immutable.Map({
          "header-two": { element: "h2" },
          "header-three": { element: "h3" },
          blockquote: { element: "blockquote" },
          "unordered-list-item": { element: "li" },
          "ordered-list-item": { element: "li" },
          unstyled: { element: "div" },
        })
      }
    }
  }
}

export const blockRenderMapArray = (layout, hasFeatures) => {
  // Get an array of blocks allowed by the editor
  const blockMap = blockRenderMap(layout, hasFeatures)
  const available = Object.keys(blockMap.toObject())

  return Array.from(available)
}

export const decorators = layout => {
  // Return custom text entities based on layout
  return [
    {
      strategy: findLinkEntities,
      component: Link,
    },
  ]
}

export const composedDecorator = layout => {
  return new CompositeDecorator(decorators(layout))
}

export const setEditorStateFromProps = props => {
  // Create a new state and formatted html based on props
  // Converts html blocks to those allowed based on layout
  // strips disallowed classes/blocks, and adds/removes end markers
  const { article, editing, hasFeatures, section } = props

  const decorators = composedDecorator(article.layout)
  const emptyState = EditorState.createEmpty(decorators)
  let editorState

  const formattedData = getFormattedState(
    emptyState,
    section.body,
    article.layout,
    hasFeatures
  )
  const html = setContentEnd(formattedData.html)

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
    styles,
  }
}
