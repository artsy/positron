#
# Image section that allows uploading large overflowing images.
#

_ = require 'underscore'
gemup = require 'gemup'
React = require 'react'
RichTextCaption = React.createFactory require '../../../../components/rich_text_caption/index.coffee'
icons = -> require('./icons.jade') arguments...
{ getIframeUrl } = require '../../../../models/section.coffee'
sd = require('sharify').data
{ section, h1, header, input, button, div, iframe, form, span, h2, img, label, nav, a } = React.DOM

module.exports = React.createClass
  displayName: 'SectionVideo'

  getInitialState: ->
    progress: null
    url: @props.section.get('url')
    caption: @props.section.get('caption')
    coverSrc: @props.section.get('cover_image_url')

  componentDidMount: ->
    $(@refs.input).focus() unless @state.url

  changeLayout: (layout) -> =>
    @props.section.set 'layout', layout

  getVideoHeight: ->
    if @props.section.get('layout') is 'column_width' then '313px' else '600px'

  onClickOff: ->
    if not @state.url and not @state.cover_image_url and not @state.caption
      @props.section.destroy()
    else
      @props.section.set
        url: @state.url
        cover_image_url: @state.coverSrc
        caption: @state.caption

  onChangeUrl: (e) ->
    @setState url: $(@refs.input).val()

  onCaptionChange: (html) ->
    @setState caption: html

  uploadCoverImage: (e) ->
    gemup e.target.files[0],
      app: sd.GEMINI_APP
      key: sd.GEMINI_KEY
      progress: (percent) =>
        @setState progress: percent
      add: (src) =>
        @setState coverSrc: src, progress: 0.1
      done: (src) =>
        image = new Image()
        image.src = src
        image.onload = =>
          @setState coverSrc: src, progress: null

  removeImage: ->
    @setState coverSrc: null

  render: ->
    coverUrl = if @state.progress then @state.coverSrc \
          else resize(@state.coverSrc, width: 1100)

    coverPreview = div {
      className: 'esv-cover-image-container'
      onClick: @props.setEditing(on)
      key: 'cover' + @props.section.cid
      style:
        backgroundImage: "url(#{coverUrl})"
        height: @getVideoHeight()
        opacity: if @state.progress then @state.progress else '1'
    },
      div {
        className: 'esv-cover-image-play-container'
      },
        div { className: 'esv-cover-image-play' }
      if @props.editing
        button {
            className: 'edit-section-remove button-reset'
            onClick: @removeImage
            dangerouslySetInnerHTML: __html: $(icons()).filter('.remove').html()
          },

    section {
      className: 'edit-section-video'
    },
      div { className: 'esv-controls-container edit-section-controls' },
        nav { className: 'esv-nav' },
          a {
            className: 'esv-overflow-fillwidth'
            onClick: @changeLayout('overflow_fillwidth')
          }
          a {
            className: 'esv-column-width'
            onClick: @changeLayout('column_width')
          }
        div { className: 'esv-inputs' },
          h2 {}, 'Video'
          input {
            className: 'bordered-input bordered-input-dark'
            placeholder: 'Paste a youtube or vimeo url ' +
              '(e.g. http://youtube.com/watch?v=id)'
            ref: 'input'
            defaultValue: @state.url
            onKeyDown: _.debounce(_.bind(@onChangeUrl, this), 500)
          }
          h2 {}, "Cover image"
          section { className: 'dashed-file-upload-container' },
            h1 {}, 'Drag & ',
              span { className: 'dashed-file-upload-container-drop' }, 'drop'
              ' or '
              span { className: 'dashed-file-upload-container-click' }, 'click'
              span {}, (' to ' + if @state.cover_image_url then 'replace' else 'upload')
            h2 {}, 'Up to 30mb'
            input { type: 'file', onChange: @uploadCoverImage }
      div { className: 'esv-video-container' },
        if @state.progress
          div { className: 'upload-progress-container' },
            div {
              className: 'upload-progress'
              style: width: (@state.progress * 100) + '%'
            }
        if @state.coverSrc or @state.url
          [
            coverPreview if @state.coverSrc
            iframe {
              src: getIframeUrl(@state.url)
              height: @getVideoHeight()
              key: 1
            }
            RichTextCaption {
              item: @state
              key: 'caption-edit' + @props.section.cid
              onChange: @onCaptionChange
              editing: @props.editing
              placeholder: 'Video Caption'
            }
          ]
        else
          div { className: 'esv-placeholder' }, 'Add a video above'
