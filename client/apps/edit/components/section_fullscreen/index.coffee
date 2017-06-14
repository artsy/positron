#
# Fullscreen section that allows uploading large overflowing images or video
#

_ = require 'underscore'
gemup = require 'gemup'
React = require 'react'
RichTextParagraph = React.createFactory require '../../../../components/rich_text/components/input_paragraph.coffee'
sd = require('sharify').data
{ div, section, span, input, button, p, textarea, video, img } = React.DOM
icons = -> require('./icons.jade') arguments...
moment = require 'moment'

module.exports = React.createClass
  displayName: 'SectionFullscreen'

  getInitialState: ->
    title: @props.section.get('title')
    background_url: @props.section.get('background_url')
    background_image_url: @props.section.get('background_image_url')
    progress: ''

  componentDidMount: ->
    $('.edit-header-container').hide()

  onClickOff: ->
    @removeSection() unless @setSection()

  setSection: ->
    return false unless @state.background_url or @state.title or @state.background_image_url
    @props.section.set
      title: @state.title
      background_url: @state.background_url
      background_image_url: @state.background_image_url

  onEditableKeyup: ->
    @setState title: $(@refs.editableTitle).val()

  removeSection: ->
    $('.edit-header-container').show()
    @props.section.destroy()

  upload: (e) ->
    gemup e.target.files[0],
      app: sd.GEMINI_APP
      key: sd.GEMINI_KEY
      progress: (percent) =>
        @setState progress: percent
      add: (src) =>
        @setState progress: 0.1
      done: (src) =>
        if src.indexOf('.mp4') > 0
          @setState background_url: src, progress: null, background_image_url: null
        else
          @setState background_image_url: src, progress: null, background_url: null
        @onClickOff()

  render: ->
    section {
      className: 'edit-section-fullscreen'
      onClick: @props.setEditing(on)
    },
      div { className: 'edit-section-controls' },
        div { className: 'esf-right-controls-container' },
          section { className: 'esf-change-background'},
            span {},
              (if @state.background_url or @state.background_image_url then '+ Change Background' else '+ Add Background'),
            input { type: 'file', onChange: @upload, accept: 'video/mp4,image/jpg,image/png,image/gif,image/jpeg' }
          button {
            className: 'edit-section-remove button-reset'
            dangerouslySetInnerHTML: __html: $(icons()).filter('.remove').html()
            onClick: @removeSection
          }
        div { className: "esf-text-container #{if sd.ARTICLE?.is_super_article then 'is-super-article' else ''}" },
          textarea {
            className: 'esf-title invisible-input'
            ref: 'editableTitle'
            placeholder: 'Title *'
            onKeyUp: @onEditableKeyup
            defaultValue: @state.title
          }
          (
            unless sd.ARTICLE?.is_super_article
              div { className: 'edit-author-section'},
                p {}, sd.ARTICLE.author.name if sd.ARTICLE?.author
                p {}, moment(sd.ARTICLE?.published_at || moment()).format('MMM D, YYYY h:mm a')
          )
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
          div { className: 'esf-fullscreen-container' },
            video {
              className: 'esf-fullscreen'
              src: @state.background_url
              key: 0
              autoPlay: true
              loop: true
            }
        else if @state.background_image_url
          div { className: 'esf-fullscreen-container' },
            img {
              className: 'esf-fullscreen'
              src: @state.background_image_url
            }
        else
          div { className: 'esf-placeholder' }
      )
