Immutable = require 'immutable'
Decorators = require '../../../../../../components/rich_text/utils/decorators.coffee'

exports.inlineStyles = ->
  return [
    {label: 'B', style: 'BOLD'}
    {label: 'I', style: 'ITALIC'}
    {label: ' S ', style: 'STRIKETHROUGH'}
  ]

exports.blockTypes = ->
  return [
    {label: 'H2', style: 'header-two'}
    {label: 'H3', style: 'header-three'}
    {label: 'UL', style: 'unordered-list-item'}
    {label: 'OL', style: 'ordered-list-item'}
  ]

exports.blockRenderMap = ->
  return Immutable.Map({
    'header-two': {
      element: 'h2'
    },
    'header-three': {
      element: 'h3'
    },
    'unordered-list-item': {
      element: 'li'
    },
    'ordered-list-item': {
      element: 'li'
    },
    'unstyled': {
      element: 'div'
      aliasedElements: ['p']
      className: 'unstyled'
    }
  })

exports.decorators = ->
  return [
    {
      strategy: Decorators.findLinkEntities
      component: Decorators.Link
    }
  ]