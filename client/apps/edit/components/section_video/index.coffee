#
# Image section that allows uploading large overflowing images.
#

_ = require 'underscore'
gemup = require 'gemup'
React = require 'react'
{ getIframeUrl } = require '../../../../models/section.coffee'
sd = require('sharify').data
{ section, h1, header, input, button, div, iframe, form, span, h2, img } = React.DOM

module.exports = React.createClass

  getInitialState: ->
    progress: null, coverSrc: @props.section.get('cover_image_url')

  componentDidMount: ->
    @props.section.on 'change:url', => @forceUpdate()
    $(@refs.input.getDOMNode()).focus() unless @props.section.get('url')

  onClickOff: ->
    if not @props.section.get('url') and not @props.section.get('cover_image_url')
      @props.section.destroy()
    else
      @props.section.set cover_image_url: @state.coverSrc

  onChangeUrl: (e) ->
    console.log 'chnage'
    @props.section.set url: $(@refs.input.getDOMNode()).val()

  uploadCoverImage: (e) ->
    gemup e.target.files[0],
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
    section { className: 'edit-section-video' },
      header { className: 'edit-section-controls' },
        h2 {}, 'Video'
        input {
          className: 'bordered-input bordered-input-dark'
          placeholder: 'Paste a youtube or vimeo url ' +
            '(e.g. http://youtube.com/watch?v=id)'
          ref: 'input'
          defaultValue: @props.section.get('url')
          onKeyDown: _.debounce(_.bind(@onChangeUrl, this), 500)
        }
        h2 {}, "Cover image"
        section { className: 'dashed-file-upload-container' },
          h1 {}, 'Drag & ',
            span { className: 'dashed-file-upload-container-drop' }, 'drop'
            ' or '
            span { className: 'dashed-file-upload-container-click' }, 'click'
            span {}, (' to ' +
              if @props.section.get('cover_image_url') then 'replace' else 'upload')
          h2 {}, 'Up to 30mb'
          input { type: 'file', onChange: @uploadCoverImage }
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
      else if @props.section.get('url')
        iframe {
          src: getIframeUrl(@props.section.get 'url')
          width: '100%'
          height: '313px'
        }
      else
        div { className: 'esv-placeholder' }, 'Add a video above'
