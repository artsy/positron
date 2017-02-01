# Using `try` here b/c Scribe is an AMD module that doesn't play nice when
# requiring it for testing in node.
try
  Scribe = require 'scribe-editor'
  scribePluginToolbar = require 'scribe-plugin-toolbar'
  scribePluginSanitizer = require '../../lib/sanitizer.coffee'
  scribePluginLinkTooltip = require 'scribe-plugin-enhanced-link-tooltip'
_ = require 'underscore'
React = require 'react'
icons = -> require('./icons.jade') arguments...
toggleScribePlaceholder = require '../../lib/toggle_scribe_placeholder.coffee'
{ div, a, p, nav, button } = React.DOM

module.exports = React.createClass
  displayName: 'ImageCaptionInput'

  getInitialState: ->
    caption: @props.caption or ''
    images: @props.images
    url: @props.url

  componentDidMount: ->
    @attachScribe()

  componentDidUpdate: ->
    @attachScribe()

  attachScribe: ->
    return if @scribe? or not @props.editing
    return unless @refs.editable
    @scribe = new Scribe @refs.editable
    @scribe.use scribePluginSanitizer {
      tags:
        i: true
        a: { href: true, target: '_blank' }
    }
    @scribe.use scribePluginToolbar @refs.toolbar
    @scribe.use scribePluginLinkTooltip()
    toggleScribePlaceholder @refs.editable

  onEditableKeyup: ->
    toggleScribePlaceholder @refs.editable
    url = $(@refs.editable).data('id')
    newImages = _.clone @props.images
    image = _.find(newImages, url: url)
    image.caption = $(@refs.editable).html()

  render: ->
    div { className: 'esis-caption-container' },
      div {
        className: 'esis-caption bordered-input'
        ref: 'editable'
        onKeyUp: @onEditableKeyup
        'data-id': @props.url
        dangerouslySetInnerHTML: __html: @props.caption
      }
      nav { ref: 'toolbar', className: 'edit-scribe-nav esis-nav' },
        button {
          'data-command-name': 'italic'
          dangerouslySetInnerHTML: __html: '&nbsp;'
          disabled: if @props.caption then false else true
          onClick: @onEditableKeyup
        }
        button {
          'data-command-name': 'linkPrompt'
          dangerouslySetInnerHTML:
            __html: "&nbsp;" + $(icons()).filter('.link').html()
          disabled: if @props.caption then false else true
          onClick: @onEditableKeyup
        }
