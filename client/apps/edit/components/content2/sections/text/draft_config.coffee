Immutable = require 'immutable'
Decorators = require '../../../../../../components/rich_text/utils/decorators.coffee'

exports.inlineStyles = (layout) ->
  styles = [
    {label: 'B', name: 'BOLD'}
    {label: 'I', name: 'ITALIC'}
  ]
  styles.push({label: ' S ', name: 'STRIKETHROUGH'}) unless layout is 'feature'
  return styles

exports.blockTypes = (layout) ->
  blocks = [
    {label: 'H2', name: 'header-two'}
    {label: 'H3', name: 'header-three'}
    {label: 'BQ', name: 'blockquote'}
    {name: 'unordered-list-item'}
  ]
  blocks.unshift({label: 'H1', name: 'header-one'}) if layout is 'feature'
  blocks.push({name: 'ordered-list-item'}) if layout is 'classic'
  return blocks

exports.blockRenderMap = (layout) ->
  blockRenderMap = Immutable.Map({
    'header-two': {element: 'h2'}
    'header-three': {element: 'h3'}
    'unordered-list-item': {element: 'li'}
    'ordered-list-item': {element: 'li'}
    'blockquote': {element: 'blockquote'}
    'unstyled': {element: 'p'}
  })
  if layout is 'feature'
    blockRenderMap = blockRenderMap.merge({'header-one': { element: 'h1' }})
  return blockRenderMap

exports.decorators = ->
  return [
    {
      strategy: Decorators.findLinkEntities
      component: Decorators.Link
    }
  ]