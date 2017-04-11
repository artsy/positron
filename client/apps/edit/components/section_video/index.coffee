#
# Image section that allows uploading large overflowing images.
#

_ = require 'underscore'
gemup = require 'gemup'
React = require 'react'
RichTextCaption = React.createFactory require '../../../../components/rich_text_caption/index.coffee'
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
    background_color: @props.section.get('background_color') or 'white'
    layout: @props.section.get('layout') or 'column_width'

  componentDidMount: ->
    $(@refs.input).focus() unless @state.url

  changeLayout: (layout) -> =>
    @setState layout: layout

  setBackgroundColor: (e) ->
    @setState background_color: e.currentTarget.value

  getVideoHeight: ->
    if @state.layout is 'column_width' then '313px' else '600px'

  getVideoWidth: ->
    if @state.layout is 'column_width' then '100%' else '1060px'

  onClickOff: ->
    if not @state.url and not @state.cover_image_url and not @state.caption
      @props.section.destroy()
    else
      @props.section.set
        url: @state.url
        cover_image_url: @state.coverSrc
        caption: @state.caption
        background_color: @state.background_color
        layout: @state.layout

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

  render: ->
    coverImage = div {
      className: 'esv-cover-image-container'
      onClick: @props.setEditing(on)
    },
      div { className: 'esv-cover-image-play-container' },
        div { className: 'esv-cover-image-play' }
      img {
        className: 'esv-cover-image'
        src: if @state.progress then @state.coverSrc \
          else resize(@state.coverSrc, width: 1100)
        style: opacity: if @state.progress then @state.progress else '1'
        key: 0
      }
    section {
      className: 'edit-section-video'
      style: { 'backgroundColor' : @state.background_color }
    },
      div { className: 'esv-controls-container edit-section-controls' },
        nav { className: 'esv-nav' },
          a {
            style: {
              'backgroundImage': 'url(/icons/edit_artworks_overflow_fillwidth.svg)'
              'backgroundSize': '38px'
            }
            className: 'esv-overflow-fillwidth'
            onClick: @changeLayout('overflow_fillwidth')
          }
          a {
            style: {
              'backgroundImage': 'url(/icons/edit_artworks_column_width.svg)'
              'backgroundSize': '22px'
            }
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
          div { className: 'esi-caption-container' },
            RichTextCaption {
              item: @state
              key: 'caption-edit' + @props.section.cid
              onChange: @onCaptionChange
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
          div { className: 'esv-background-color flat-radio-button' },
            h2 {}, "Background Color"
            input {
              type: 'radio'
              name: 'background_color'
              value: 'white'
              className: 'esv-background-white'
              defaultChecked: (@state.background_color is 'white')
              onClick: @setBackgroundColor
            }
            label {}, "White"
            input {
              type: 'radio'
              name: 'background_color'
              value: 'black'
              className: 'esv-background-black'
              defaultChecked: (@state.background_color is 'black')
              onClick: @setBackgroundColor
            }
            label {}, "Black"
      if @state.progress
        [
          div { className: 'upload-progress-container' },
            div {
              className: 'upload-progress'
              style: width: (@state.progress * 100) + '%'
            }
          coverImage if @state.coverSrc
        ]
      else if @state.coverSrc
        coverImage
      else if @state.url
        [
          iframe {
            src: getIframeUrl(@state.url)
            width: @getVideoWidth()
            height: @getVideoHeight()
            key: 1
          }
          div {
            className: 'esi-inline-caption'
            dangerouslySetInnerHTML: __html: @state.caption
            key: 2
          }
        ]
      else
        div { className: 'esv-placeholder' }, 'Add a video above'
