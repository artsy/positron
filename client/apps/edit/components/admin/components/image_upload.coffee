React = require 'react'
ReactDOM = require 'react-dom'
gemup = require 'gemup'
request = require 'superagent'
sd = require('sharify').data
{ crop } = require '../../../../../components/resizer/index.coffee'
{ section, h1, h2, span, input, div, video } = React.DOM

module.exports = React.createClass
  displayName: 'ImageUpload'

  getInitialState: ->
    progress: 0
    error: false
    errorType: null
    isDragover: false
    size: @props.size || 10

  getAcceptedTypes: () ->
    acceptedTypes = ['image/jpg','image/jpeg','image/gif','image/png']
    acceptedTypes.push 'video/mp4' if @props.hasVideo
    return acceptedTypes

  upload: (e) ->
    @onDragLeave()
    file = e.target.files[0]
    if file?.size > (@state.size * 1000000)
      @setState error: true, errorType: 'size'
      return
    if file?.type not in @getAcceptedTypes()
      @setState error: true, errorType: 'type'
      return
    if @props.isDisplay
      request
        .post("#{sd.APP_URL}/display/upload")
        .send({
          name: file.name
          type: file.type
        })
        .end((err, result) =>
          request
            .put(result.body.signedRequest)
            .send(file)
            .set('Content-Type', file.type)
            .end((err, res) =>
              @props.onChange(@props.name, result.body.url) if @props.onChange
              @setState progress: 0, error: false, errorType: null
            )
        )
    else
      gemup e.target.files[0],
        app: sd.GEMINI_APP
        key: sd.GEMINI_KEY
        progress: (percent) =>
          @setState progress: percent
        add: (src) =>
          @setState progress: 0.1, isDragover: false
        done: (src) =>
          @props.onChange(@props.name, src) if @props.onChange
          @setState progress: 0, error: false, errorType: null

  onClick: ->
    @setState error: false, errorType: null

  onDragEnter: ->
    unless @props.disabled
      @setState isDragover: true

  onDragLeave: ->
    @setState isDragover: false

  remove: ->
    @props.onChange(@props.name, '') if @props.onChange

  progressBar: ->
    if @state.progress
      div { className: 'upload-progress-container' },
        div {
          className: 'upload-progress'
          style: width: (@state.progress * 100) + '%'
        }

  previewImage: ->
    if @props.src and !@state.progress > 0 and !@props.hidePreview
      div { className: 'preview' },
        if @props.src.includes('.mp4')
            div {
              className: 'image-upload-form-preview'
              style: display: 'block'
            },
              video {
                src: @props.src
              }
              if !@props.hasVideo
                div {
                  className: 'video-error'
                }, 'Video files are not allowed in this format.'
        else
          div {
            className: 'image-upload-form-preview'
            style: backgroundImage: 'url(' + crop(@props.src, width: 215, height: 150) + ')', display: 'block'
          }
        unless  @props.disabled
          div {
            className: 'image-upload-form-remove'
            style: display: 'block'
            onClick: @remove
          }

  render: ->
    disabled = if @props.disabled then ' disabled' else ''
    isDragover = if @state.isDragover then ' is-dragover' else ''
    fileTypeError = if @props.hasVideo then 'Please choose .png, .jpg, .gif, or .mp4' else 'Please choose .png, .jpg, or .gif'
    error = if @state.errorType is 'size' then 'File is too large' else fileTypeError

    section {
      className: 'image-upload-form' + disabled + isDragover
      onClick: @onClick
      onDragEnter: @onDragEnter
      onDragLeave: @onDragLeave
    },
      h1 {}, 'Drag & ',
        span { className: 'image-upload-form-drop' }, 'drop'
        ' or '
        span { className: 'image-upload-form-click' }, 'click'
      h2 {}, 'Up to ' + @state.size + 'mb'
      input {
        type: 'file'
        accept: @getAcceptedTypes()
        onChange: @upload
        className: 'image-upload-form-input'
        disabled: @props.disabled
      }
      @previewImage() unless @props.hidePreview
      @progressBar()

      if @state.error
        div {
          className: 'size-error'
          style: display: 'block'
        }, error
