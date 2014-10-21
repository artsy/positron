#
# Text section that display large bodies of copy and can split itself
# between empty paragraphs to insert a new section.
#

Scribe = -> require('scribe-editor') arguments...
scribePluginToolbar = -> require('scribe-plugin-toolbar') arguments...
scribePluginSanitizer = require './sanitizer.coffee'
SectionHoverControls = -> require('../section_hover_controls/index.coffee') arguments...
React = require 'react'
{ div, nav, button } = React.DOM

module.exports = React.createClass

  onClickOff: ->
    @props.section.set body: $(@refs.editable.getDOMNode()).html()
    if $(@props.section.get('body')).text() is ''
      @props.section.destroy()
    else
      @setEditing(false)()

  setEditing: (editing) -> =>
    return if editing is @props.editing
    @props.onSetEditing if editing then @props.key else null

  attachScribe: ->
    return unless @props.editing
    scribe = new Scribe @refs.editable.getDOMNode()
    scribe.use scribePluginSanitizer {
      tags:
        p: true
        b: true
        i: true
        a: { href: true, target: '_blank' }
    }
    scribe.use scribePluginToolbar @refs.toolbar.getDOMNode()
    $(@refs.editable.getDOMNode()).focus()

  componentDidMount: ->
    @attachScribe()

  componentDidUpdate: ->
    @attachScribe()

  render: ->
    div {
      className: 'edit-section-text-container edit-section-container'
      'data-state-editing': @props.editing
    },
      SectionHoverControls {
        section: @props.section
        onClick: @setEditing(true)
      }
      nav { ref: 'toolbar' },
        button { 'data-command-name': 'bold' }, 'B'
        button { 'data-command-name': 'italic' }, 'I'
      div {
        className: 'edit-section-text-editable'
        ref: 'editable'
        onClick: @setEditing(true)
        dangerouslySetInnerHTML: __html: @props.section.get('body')
      }
      div {
        className: 'edit-section-text-editing-bg'
        onClick: @onClickOff
      }
