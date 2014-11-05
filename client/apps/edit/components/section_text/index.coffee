#
# Text section that display large bodies of copy and can split itself
# between empty paragraphs to insert a new section.
#

# Using `try` here b/c Scribe is an AMD module that doesn't play nice when
# requiring it for testing in node.
try
  Scribe = require 'scribe-editor'
  scribePluginToolbar = require 'scribe-plugin-toolbar'
  scribePluginSanitizer = require './sanitizer.coffee'
  scribePluginLinkPromptCommand = require 'scribe-plugin-link-prompt-command'
React = require 'react'
icons = -> require('./icons.jade') arguments...
{ div, nav, button } = React.DOM

module.exports = React.createClass

  onClickOff: ->
    @props.section.set body: $(@refs.editable.getDOMNode()).html()
    @props.section.destroy() if $(@props.section.get('body')).text() is ''

  attachScribe: ->
    return unless @props.editing
    @scribe?.destroy()
    @scribe = new Scribe @refs.editable.getDOMNode()
    @scribe.use scribePluginSanitizer {
      tags:
        p: true
        b: true
        i: true
        a: { href: true, target: '_blank' }
    }
    @scribe.use scribePluginToolbar @refs.toolbar.getDOMNode()
    @scribe.use scribePluginLinkPromptCommand({})
    $(@refs.editable.getDOMNode()).focus()

  componentDidMount: ->
    @attachScribe()

  componentDidUpdate: ->
    @attachScribe()

  componentWillUnmount: ->
    @scribe.destroy()

  render: ->
    div { className: 'edit-section-text-container' },
      nav { ref: 'toolbar', className: 'edit-section-controls' },
        button {
          'data-command-name': 'bold'
          dangerouslySetInnerHTML: __html: '&nbsp;'
        }
        button {
          'data-command-name': 'italic'
          dangerouslySetInnerHTML: __html: '&nbsp;'
        }
        div { className: 'est-link-container' },
          button {
            'data-command-name': 'linkPrompt'
            dangerouslySetInnerHTML:
              __html: "&nbsp;" + $(icons()).filter('.link').html()
          }
          button { 'data-command-name': 'unlink' }
        button {
          'data-command-name': 'removeFormat'
          dangerouslySetInnerHTML:
            __html: "&nbsp;" + $(icons()).filter('.remove-formatting').html()
        }
      div {
        className: 'edit-section-text-editable'
        ref: 'editable'
        dangerouslySetInnerHTML: __html: @props.section.get('body')
        onClick: @props.setEditing(on)
        onFocus: @props.setEditing(on)
      }
