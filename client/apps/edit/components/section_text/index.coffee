#
# Text section that display large bodies of copy and can split itself
# between empty paragraphs to insert a new section.
#

# Using `try` here b/c Scribe is an AMD module that doesn't play nice when
# requiring it for testing in node.
try
  Scribe = require 'scribe-editor'
  scribePluginToolbar = require 'scribe-plugin-toolbar'
  scribePluginSanitizer = require '../../lib/sanitizer.coffee'
  scribePluginLinkTooltip = require 'scribe-plugin-enhanced-link-tooltip'
  scribePluginKeyboardShortcuts = require 'scribe-plugin-keyboard-shortcuts'
  scribePluginHeadingCommand = require 'scribe-plugin-heading-command'
  scribePluginSanitizeGoogleDoc = require 'scribe-plugin-sanitize-google-doc'
  scribePluginJumpLink = require 'scribe-plugin-jump-link'
React = require 'react'
icons = -> require('./icons.jade') arguments...
{ div, nav, button } = React.DOM
sd = require('sharify').data
{ isEditorialTeam } = require '../../../../models/user.coffee'

keyboardShortcutsMap =
  bold: (e) -> e.metaKey and e.keyCode is 66
  italic: (e) -> e.metaKey and e.keyCode is 73
  h2: (e) -> e.metaKey && e.keyCode is 50
  h3: (e) -> e.metaKey && e.keyCode is 51
  removeFormat: (e) -> e.altKey and e.shiftKey and e.keyCode is 65
  linkPrompt: (e) -> e.metaKey and not e.shiftKey and e.keyCode is 75
  unlink: (e) -> e.metaKey and e.shiftKey and e.keyCode is 75
  insertOrderedList: (e) -> e.metaKey and e.shiftKey and e.keyCode is 56
  insertUnorderedList: (e) -> e.metaKey and e.shiftKey and e.keyCode is 55

module.exports = React.createClass

  componentDidMount: ->
    @attachScribe()
    @componentDidUpdate()

  componentDidUpdate: ->
    $(@refs.editable.getDOMNode()).focus() if @props.editing

  shouldComponentUpdate: (nextProps) ->
    not (nextProps.editing and @props.editing)

  onClickOff: ->
    @setBody()
    @props.section.destroy() if $(@props.section.get('body')).text() is ''

  setBody: ->
    @props.section.set body: $(@refs.editable.getDOMNode()).html()

  attachScribe: ->
    @scribe = new Scribe @refs.editable.getDOMNode()
    @scribe.use scribePluginSanitizeGoogleDoc()
    @scribe.use scribePluginSanitizer {
      tags:
        p: true
        b: true
        i: true
        br: true
        a: { href: true, target: '_blank' }
        h2: true
        h3: true
        ol: true
        ul: true
        li: true
    }
    @scribe.use scribePluginToolbar @refs.toolbar.getDOMNode()
    @scribe.use scribePluginLinkTooltip()
    @scribe.use scribePluginKeyboardShortcuts keyboardShortcutsMap
    @scribe.use scribePluginHeadingCommand(2)
    @scribe.use scribePluginHeadingCommand(3)
    @scribe.use scribePluginJumpLink()

  render: ->
    div { className: 'edit-section-text-container' },
      nav {
        ref: 'toolbar'
        className: 'edit-section-controls est-nav edit-scribe-nav'
        onClick: @setBody
      },
        button {
          'data-command-name': 'bold'
          dangerouslySetInnerHTML: __html: '&nbsp;'
        }
        button {
          'data-command-name': 'italic'
          dangerouslySetInnerHTML: __html: '&nbsp;'
        }
        button {
          'data-command-name': 'h2'
        }
        button {
          'data-command-name': 'h3'
        }
        button {
          'data-command-name': 'insertOrderedList'
          dangerouslySetInnerHTML:
            __html: "&nbsp;" + $(icons()).filter('.ordered-list').html()
        }
        button {
          'data-command-name': 'insertUnorderedList'
          dangerouslySetInnerHTML:
            __html: "&nbsp;" + $(icons()).filter('.unordered-list').html()
        }
        div { className: 'est-link-container' },
          button {
            'data-command-name': 'linkPrompt'
            dangerouslySetInnerHTML:
              __html: "&nbsp;" + $(icons()).filter('.link').html()
          }
          button { 'data-command-name': 'unlink' }
        if isEditorialTeam(sd.USER)
          button {
            'data-command-name': 'jumpLink'
            dangerouslySetInnerHTML:
              __html: "&nbsp;" + $(icons()).filter('.jump-link').html()
          }
        button {
          'data-command-name': 'removeFormat'
          dangerouslySetInnerHTML:
            __html: "&nbsp;" + $(icons()).filter('.remove-formatting').html()
        }
      div { className: 'est-editable-container' },
        div {
          className: 'edit-section-text-editable'
          ref: 'editable'
          dangerouslySetInnerHTML: __html: @props.section.get('body')
          onClick: @props.setEditing(on)
          onFocus: @props.setEditing(on)
          onKeyUp: @setBody
        }
