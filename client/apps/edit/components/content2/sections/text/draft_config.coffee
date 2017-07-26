Immutable = require 'immutable'
Decorators = require '../../../../../../components/rich_text/utils/decorators.coffee'

exports.inlineStyles = ->
  return [
    {label: 'B', style: 'BOLD'}
    {label: 'I', style: 'ITALIC'}
    {label: ' S ', style: 'STRIKETHROUGH'}
  ]

exports.blockTypes = (layout) ->
  blocks = [
    {label: 'H2', style: 'header-two'}
    {label: 'H3', style: 'header-three'}
    {label: 'UL', style: 'unordered-list-item'}
    {label: 'OL', style: 'ordered-list-item'}
    {label: 'BQ', style: 'blockquote'}
  ]
  if layout is 'feature'
    blocks.push({label: 'H1', style: 'header-one'})
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