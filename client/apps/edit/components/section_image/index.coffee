#
# Image section that allows uploading large overflowing images.
#

# Using `try` here b/c Scribe is an AMD module that doesn't play nice when
# requiring it for testing in node.
try
  Scribe = require 'scribe-editor'
  scribePluginToolbar = require 'scribe-plugin-toolbar'
  scribePluginSanitizer = require '../../lib/sanitizer.coffee'
  scribePluginLinkTooltip = require 'scribe-plugin-enhanced-link-tooltip'
_ = require 'underscore'
gemup = require 'gemup'
React = require 'react'
toggleScribePlaceholder = require '../../lib/toggle_scribe_placeholder.coffee'
sd = require('sharify').data
icons = -> require('./icons.jade') arguments...
{ div, section, h1, h2, span, img, header, input, nav, a, button, p } = React.DOM
{ crop, resize, fill } = require '../../../../components/resizer/index.coffee'

module.exports = React.createClass

  getInitialState: ->
    src: @props.section.get('url')
    progress: null
    caption: @props.section.get('caption')
    width: @props.section.get('width')
    height: @props.section.get('height')

  componentDidMount: ->
    @attachScribe()

  componentDidUpdate: ->
    @attachScribe()

  onClickOff: ->
    if @state.src
      @props.section.set
        url: @state.src
        caption: @state.caption
        width: @state.width
        height: @state.height
    else
      @props.section.destroy()

  changeLayout: (layout) -> =>
    @setState layout: layout
    @props.section.set layout: layout

  upload: (e) ->
    @props.setEditing(off)()
    gemup e.target.files[0],
      app: sd.GEMINI_APP
      key: sd.GEMINI_KEY
      progress: (percent) =>
        @setState progress: percent
      add: (src) =>
        @setState src: src, progress: 0.1
      done: (src) =>
        image = new Image()
        image.src = src
        image.onload = =>
          @setState
            src: src
            progress: null
            width: image.width
            height: image.height
          @onClickOff()

  attachScribe: ->
    return if @scribe? or not @props.editing
    @scribe = new Scribe @refs.editable.getDOMNode()
    @scribe.use scribePluginSanitizer {
      tags:
        i: true
        a: { href: true, target: '_blank' }
    }
    @scribe.use scribePluginToolbar @refs.toolbar.getDOMNode()
    @scribe.use scribePluginLinkTooltip()
    toggleScribePlaceholder @refs.editable.getDOMNode()

  onEditableKeyup: ->
    toggleScribePlaceholder @refs.editable.getDOMNode()
    @setState caption: $(@refs.editable.getDOMNode()).html()

  render: ->
    section {
      className: 'edit-section-image'
      onClick: @props.setEditing(true)
    },
      div { className: 'esi-controls-container edit-section-controls' },
        nav { className: 'esi-nav es-layout' },
          a {
            style: {
              backgroundImage: 'url(/icons/edit_artworks_overflow_fillwidth.svg)'
              backgroundSize: '38px'
            }
            className: 'esi-overflow-fillwidth'
            onClick: @changeLayout('overflow_fillwidth')
          }
          a {
            style: {
              backgroundImage: 'url(/icons/edit_artworks_column_width.svg)'
              backgroundSize: '22px'
            }
            className: 'esi-column-width'
            onClick: @changeLayout('column_width')
        }
        div { className: 'esi-inputs' },
          section { className: 'dashed-file-upload-container' },
            h1 {}, 'Drag & ',
              span { className: 'dashed-file-upload-container-drop' }, 'drop'
              ' or '
              span { className: 'dashed-file-upload-container-click' }, 'click'
              span {}, (' to ' +
                if @props.section.get('url') then 'replace' else 'upload')
            h2 {}, 'Up to 30mb'
            input { type: 'file', onChange: @upload }
          div { className: 'esi-caption-container' },
            nav { ref: 'toolbar', className: 'edit-scribe-nav' },
              button {
                'data-command-name': 'italic'
                dangerouslySetInnerHTML: __html: '&nbsp;'
                disabled: if @state.caption then false else true
                onClick: @onEditableKeyup
              }
              button {
                'data-command-name': 'linkPrompt'
                dangerouslySetInnerHTML:
                  __html: "&nbsp;" + $(icons()).filter('.link').html()
                disabled: if @state.caption then false else true
                onClick: @onEditableKeyup
              }
            div {
              className: 'esi-caption bordered-input'
              ref: 'editable'
              onKeyUp: @onEditableKeyup
              dangerouslySetInnerHTML: __html: @props.section.get('caption')
            }
      (
        if @state.progress
          div { className: 'upload-progress-container' },
            div {
              className: 'upload-progress'
              style: width: (@state.progress * 100) + '%'
            }
      )
      (
        if @state.src
          [
            img {
              className: 'esi-image'
              src: if @state.progress then @state.src else resize(@state.src, width: 900)
              style: opacity: if @state.progress then @state.progress else '1'
              key: 0
            }
            div {
              className: 'esi-inline-caption'
              dangerouslySetInnerHTML: __html: @state.caption
              key: 1
            }
          ]
        else
          div { className: 'esi-placeholder' }, 'Add an image above'
      )
