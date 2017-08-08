Immutable = require 'immutable'
Decorators = require '../../../../../../components/rich_text2/utils/decorators.coffee'

exports.inlineStyles = (layout, hasFeatures) ->
  # for menu display only
  styles = [
    {label: 'B', name: 'BOLD'}
    {label: 'I', name: 'ITALIC'}
  ]
  if layout is 'standard'
    styles.push({label: ' S ', name: 'STRIKETHROUGH'})
  return styles

exports.blockTypes = (layout, hasFeatures) ->
  # for menu display only
  blocks = [
    {label: 'H2', name: 'header-two'}
    {label: 'H3', name: 'header-three'}
    {name: 'unordered-list-item'}
  ]
  blocks.unshift({label: 'H1', name: 'header-one'}) if layout is 'feature'
  blocks.push({name: 'ordered-list-item'}) if layout is 'classic'
  blocks.push({name: 'blockquote'}) if hasFeatures
  return blocks

exports.blockRenderMap = (layout, hasFeatures) ->
  # declares blocks avaialable to the editor
  unless hasFeatures
  # classic, partners
    return Immutable.Map({
      'header-two': {element: 'h2'}
      'header-three': {element: 'h3'}
      'unordered-list-item': {element: 'li'}
      'ordered-list-item': {element: 'li'}
      'unstyled': {element: 'p'}
    })
  if layout is 'feature'
    return Immutable.Map({
      'header-one': { element: 'h1' }
      'header-two': {element: 'h2'}
      'header-three': {element: 'h3'}
      'blockquote': {element: 'blockquote'}
      'unordered-list-item': {element: 'li'}
      'ordered-list-item': {element: 'li'}
      'unstyled': {element: 'p'}
    })
  else
    # standard, classic on internal channels
    return Immutable.Map({
      'header-two': {element: 'h2'}
      'header-three': {element: 'h3'}
      'blockquote': {element: 'blockquote'}
      'unordered-list-item': {element: 'li'}
      'ordered-list-item': {element: 'li'}
      'unstyled': {element: 'p'}
    })

exports.decorators = (layout) ->
  if layout is 'feature'
    return [
      {
        strategy: Decorators.findLinkEntities
        component: Decorators.Link
      },
      {
        strategy: Decorators.findContentStartEntities
        component: Decorators.ContentStartEnd
      },
      {
        strategy: Decorators.findContentEndEntities
        component: Decorators.ContentStartEnd
      }
    ]
  else if layout is 'standard'
    return [
      {
        strategy: Decorators.findLinkEntities
        component: Decorators.Link
      },
      {
        strategy: Decorators.findContentEndEntities
        component: Decorators.ContentStartEnd
      }
    ]
  else
    return [
      {
        strategy: Decorators.findLinkEntities
        component: Decorators.Link
      }
    ]
