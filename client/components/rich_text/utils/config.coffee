Immutable = require 'immutable'
Decorators = require './decorators.coffee'

exports.blockRenderMap = ->
  return Immutable.Map({
    'unstyled': {element: 'p'}
  })

exports.inlineStyles = (type) ->
  # for menu display only
  styles = [ ]
  if type isnt 'postscript'
    styles.push({label: 'I', name: 'ITALIC'})
  if type isnt 'caption'
    styles.push({label: 'B', name: 'BOLD'})
  return styles

exports.decorators = (linked) ->
  decorators = []
  if linked
    decorators.push({
      strategy: Decorators.findLinkEntities
      component: Decorators.Link
    })
  return decorators