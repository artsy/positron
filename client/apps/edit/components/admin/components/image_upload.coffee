React = require 'react'
ReactDOM = require 'react-dom'
gemup = require 'gemup'
sd = require('sharify').data
{ section, h1, h2, span, input, div } = React.DOM

module.exports = React.createClass
  displayName: 'ImageUpload'

  getInitialState: ->
    progress: 0
    src: @props.src || ''
    error: false
    errorType: null
    isDragover: false
    size: @props.size || 10

  upload: (e) ->
    @onDragLeave()
    if e.target.files[0]?.size > (@state.size * 1000000)
      @setState error: true, errorType: 'size'
      return
    acceptedTypes = ['image/jpg','image/jpeg','image/gif','image/png']
    if e.target.files[0]?.type not in acceptedTypes
      @setState error: true, errorType: 'type'
      return
    gemup e.target.files[0],
      app: sd.GEMINI_APP
      key: sd.GEMINI_KEY
      progress: (percent) =>
        @setState progress: percent
      add: (src) =>
        @setState src: src, progress: 0.1, isDragover: false
      done: (src) =>
        @setState src: src, progress: 0, error: false, errorType: null
        @props.onChange(@props.name, src) if @props.onChange

  onClick: ->
    @setState error: false, errorType: null

  onDragEnter: ->
    unless @props.disabled
      @setState isDragover: true

  onDragLeave: ->
    @setState isDragover: false

  remove: ->
    @setState src: ''
    @props.onChange('', @props.name) if @props.onChange

  progressBar: ->
    if @state.progress
      div { className: 'upload-progress-container' },
        div {
          className: 'upload-progress'
          style: width: (@state.progress * 100) + '%'
        }

  previewImage: ->
    if @state.src and !@state.progress > 0
      div { className: 'preview' },
        div {
          className: 'image-upload-form-preview'
          style: backgroundImage: 'url(' + @state.src + ')', display: 'block'
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
    error = if @state.errorType is 'size' then 'File is too large' else 'Please choose .png, .jpg, or .gif'

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
        accept: ['image/jpg','image/jpeg','image/gif','image/png']
        onChange: @upload
        className: 'image-upload-form-input'
        disabled: @props.disabled
      }
      @previewImage()
      @progressBar()

      if @state.error
        div {
          className: 'size-error'
          style: display: 'block'
        }, error
