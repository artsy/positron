React = require 'react'
ReactDOM = require 'react-dom'
gemup = require 'gemup'
sd = require('sharify').data
{ section, h1, h2, span, input, div, label, img } = React.DOM
icons = -> require('../../templates/authors/authors_icons.jade') arguments...
{ crop } = require '../../../../components/resizer/index.coffee'

module.exports = AuthorImage = React.createClass
  displayName: 'AuthorImage'

  getInitialState: ->
    src: @props.src || ''
    error: false
    errorType: null

  componentWillReceiveProps: (nextProps) ->
    @setState src: nextProps.src

  upload: (e) ->
    if e.target.files[0]?.size > 500000
      @setState error: true, errorType: 'size'
      return
    acceptedTypes = ['image/jpg','image/jpeg','image/png']
    if e.target.files[0]?.type not in acceptedTypes
      @setState error: true, errorType: 'type'
      return
    gemup e.target.files[0],
      app: sd.GEMINI_APP
      key: sd.GEMINI_KEY
      done: (src) =>
        @setState src: src, error: false, errorType: null
        @props.onChange src

  render: ->
    error = if @state.errorType is 'size' then 'File is too large. 500KB Limit.' else 'Please choose .png, .jpg, or .gif'

    div {className: 'field-group'},
      label {}, 'Profile Photo'
      div { className: 'author-edit__image'},
        if @state.src
          img {src: crop(@state.src, {width: 80, height: 80})}
        else
          div {
            className: 'author-edit__image-missing'
            dangerouslySetInnerHTML: __html:
              $(icons()).filter('.profile-icon').html()
          }
        div {
          className: 'author-edit__change-image'
        },
          'Click to ' +
            if @state.src then 'Replace' else 'Upload'
          input {
            type: 'file'
            accept: ['image/jpg','image/jpeg','image/gif','image/png']
            onChange: @upload
            className: 'image-upload-form-input'
          }
      if @state.error
        div {
          className: 'size-error'
          style: display: 'block'
        }, error
