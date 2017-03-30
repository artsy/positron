React = require 'react'
ReactDOM = require 'react-dom'
gemup = require 'gemup'
sd = require('sharify').data
{ section, h1, h2, span, input, div } = React.DOM

module.exports = React.createClass
  displayName: 'ImageUpload'

  getInitialState: ->
    progress: 0
    src: ''
    error: false

  upload: (e) ->
    if e.target.files[0]?.size > 10000000
      @setState error: true
      return
    gemup e.target.files[0],
      app: sd.GEMINI_APP
      key: sd.GEMINI_KEY
      progress: (percent) =>
        @setState progress: percent
      add: (src) =>
        @setState src: src, progress: 0.1
      done: (src) =>
        @setState src: src, progress: 0
        @props.upload(src, @props.name) if @props.upload

  onClick: ->
    @setState error: false

  remove: ->
    @setState src: ''
    @props.upload('', @props.name) if @props.upload

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
        div {
          className: 'image-upload-form-remove'
          style: display: 'block'
          onClick: @remove
        }, 'x'

  render: ->
    disabled = if @props.disabled then ' disabled' else ''

    section { className: 'image-upload-form' + disabled, onClick: @onClick },
      h1 {}, 'Drag & ',
        span { className: 'image-upload-form-drop' }, 'drop'
        ' or '
        span { className: 'image-upload-form-click' }, 'click'
      h2 {}, 'Up to 10mb'
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
        }, 'File is too large'
