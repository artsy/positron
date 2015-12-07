#
# Fullscreen section that allows uploading large overflowing images and an intro text.
#

# Using `try` here b/c Scribe is an AMD module that doesn't play nice when
# requiring it for testing in node.
try
  Scribe = require 'scribe-editor'
  scribePluginSanitizer = require '../../lib/sanitizer.coffee'
  scribePluginKeyboardShortcuts = require 'scribe-plugin-keyboard-shortcuts'
  scribePluginSanitizeGoogleDoc = require 'scribe-plugin-sanitize-google-doc'
_ = require 'underscore'
gemup = require 'gemup'
React = require 'react'
toggleScribePlaceholder = require '../../lib/toggle_scribe_placeholder.coffee'
sd = require('sharify').data
{ div, section, h1, h2, span, img, header, input, nav, a, button, p, textarea, video } = React.DOM
{ crop, resize, fill } = require('embedly-view-helpers')(sd.EMBEDLY_KEY)
icons = -> require('./icons.jade') arguments...
moment = require 'moment'

keyboardShortcutsMap =
  bold: (e) -> e.metaKey and e.keyCode is 66
  italic: (e) -> e.metaKey and e.keyCode is 73
  removeFormat: (e) -> e.altKey and e.shiftKey and e.keyCode is 65

module.exports = React.createClass

  getInitialState: ->
    title: @props.section.get('title')
    intro: @props.section.get('intro')
    background_url: @props.section.get('background_url')
    progress: ''

  componentDidMount: ->
    @attachScribe()
    $('.edit-header-container').hide()

  componentDidUpdate: ->
    @attachScribe()

  onClickOff: ->
    if @state.background_url or @state.title or @state.intro
      @props.section.set
        title: @state.title
        intro: @state.intro
        background_url: @state.background_url
      console.log @props
    else
      @removeSection()

  removeSection: ->
    $('.edit-header-container').show()
    @props.section.destroy()

  upload: (e) ->
    gemup e.target.files[0],
      key: sd.GEMINI_KEY
      progress: (percent) =>
        @setState progress: percent
      add: (src) =>
        @setState progress: 0.1
      done: (src) =>
        @setState background_url: src, progress: null
        @onClickOff()

  attachScribe: ->
    return if @scribeIntro? or not @props.editing
    @scribeIntro = new Scribe @refs.editableIntro.getDOMNode()
    @scribeIntro.use scribePluginSanitizeGoogleDoc()
    @scribeIntro.use scribePluginSanitizer {
      tags:
        p: true
        b: true
        i: true
    }
    toggleScribePlaceholder @refs.editableIntro.getDOMNode()
    @scribeIntro.use scribePluginKeyboardShortcuts keyboardShortcutsMap

  onEditableKeyup: ->
    toggleScribePlaceholder @refs.editableIntro.getDOMNode()
    @setState
      title: $(@refs.editableTitle.getDOMNode()).val()
      intro: $(@refs.editableIntro.getDOMNode()).html()

  render: ->
    section {
      className: 'edit-section-fullscreen'
      onClick: @props.setEditing(on)
    },
      div { className: 'edit-section-controls' },
        div { className: 'esf-right-controls-container' },
          section { className: 'esf-change-background'},
            span {},
              (if @state.background_url then '+ Change Background' else '+ Add Background'),
            input { type: 'file', onChange: @upload }
          button {
            className: 'edit-section-remove button-reset'
            dangerouslySetInnerHTML: __html: $(icons()).filter('.remove').html()
            onClick: @removeSection
          }
        div { className: "esf-text-container #{if sd.ARTICLE.is_super_article then 'is-super-article' else ''}" },
          textarea {
            className: 'esf-title invisible-input'
            ref: 'editableTitle'
            placeholder: 'Title *'
            onKeyUp: @onEditableKeyup
          }, @props.section.get('title')
          (
            unless sd.ARTICLE.is_super_article
              div { className: 'edit-author-section'},
                p {}, sd.ARTICLE.author.name if sd.ARTICLE.author
                p {}, moment(sd.ARTICLE.published_at || moment()).format('MMM D, YYYY h:mm a')
          )
          div {
            className: 'esf-intro'
            ref: 'editableIntro'
            dangerouslySetInnerHTML: __html: @props.section.get('intro')
            onKeyUp: @onEditableKeyup
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
        if @state.background_url
          div { className: 'esf-video-container' },
            video {
              className: 'esf-video'
              src: @state.background_url
              key: 0
              autoPlay: true
              loop: true
            }
        else
          div { className: 'esf-placeholder' }
      )
