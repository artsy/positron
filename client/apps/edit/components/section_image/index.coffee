#
# Image section that allows uploading large overflowing images.
#

_ = require 'underscore'
gemup = require 'gemup'
React = require 'react'
sd = require('sharify').data
{ div, section, h1, h2, span, img, header, input } = React.DOM

module.exports = React.createClass

  getInitialState: ->
    { src: @props.section.get('url'), progress: null }

  onClickOff: ->
    if @state.src
      @props.section.set url: @state.src
    else
      @props.section.destroy()

  upload: (e) ->
    @props.setEditing(off)()
    gemup e.target.files[0],
      key: sd.GEMINI_KEY
      progress: (percent) =>
        @setState progress: percent
      add: (src) =>
        @setState src: src, progress: 0.1
      done: (src) =>
        image = new Image()
        image.src = src
        image.onload = =>
          @setState src: src, progress: null
          @onClickOff()

  render: ->
    section {
      className: 'edit-section-image'
      onClick: @props.setEditing(true)
    },
      header { className: 'edit-section-controls' },
        div { className: 'dashed-file-upload-container' },
          h1 {}, 'Drag & ',
            span { className: 'dashed-file-upload-container-drop' }, 'drop'
            span {}, ' or ',
            span { className: 'dashed-file-upload-container-click' }, 'click'
            span {}, (' to ' +
              if @props.section.get('url') then 'replace' else 'upload')
          h2 {}, 'Up to 30mb'
          input { type: 'file', onChange: @upload }
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
          img {
            className: 'esi-image'
            src: @state.src
            style: opacity: if @state.progress then @state.progress else '1'
          }
        else
          div { className: 'esi-placeholder' }, 'Add an image above'
      )
