#
# Image section that allows uploading large overflowing images.
#

_ = require 'underscore'
gemup = require 'gemup'
React = require 'react'
RichTextCaption = React.createFactory require '../../../../components/rich_text_caption/index.coffee'
sd = require('sharify').data
icons = -> require('./icons.jade') arguments...
{ div, section, h1, h2, span, img, header, input, nav, a, button, p } = React.DOM
{ crop, resize, fill } = require '../../../../components/resizer/index.coffee'

module.exports = React.createClass
  displayName: 'SectionImage'

  getInitialState: ->
    src: @props.section.get('url')
    progress: null
    caption: @props.section.get('caption')
    width: @props.section.get('width')
    height: @props.section.get('height')

  onClickOff: ->
    if @state.src
      @props.section.set
        url: @state.src
        caption: @state.caption
        width: @state.width
        height: @state.height
    else
      @props.section.destroy()

  onCaptionChange: (html) ->
    @setState
      caption: html

  upload: (e) ->
    @props.setEditing(off)()
    gemup e.target.files[0],
      app: sd.GEMINI_APP
      key: sd.GEMINI_KEY
      progress: (percent) =>
        @setState progress: percent
      add: (src) =>
        @setState src: src, progress: 0.1
      done: (src) =>
        image = new Image()
        image.src = src
        image.onload = =>
          @setState
            src: src
            progress: null
            width: image.width
            height: image.height
          @onClickOff()

  render: ->
    section {
      className: 'edit-section-image'
      onClick: @props.setEditing(true)
    },
      div { className: 'esi-controls-container edit-section-controls' },
        div { className: 'esi-inputs' },
          section { className: 'dashed-file-upload-container' },
            h1 {}, 'Drag & ',
              span { className: 'dashed-file-upload-container-drop' }, 'drop'
              ' or '
              span { className: 'dashed-file-upload-container-click' }, 'click'
              span {}, (' to ' +
                if @props.section.get('url') then 'replace' else 'upload')
            h2 {}, 'Up to 30mb'
            input { type: 'file', onChange: @upload }
          div { className: 'esi-caption-container' },
            RichTextCaption {
              item: @state
              key: 'caption-edit' + @props.section.cid
              onChange: @onCaptionChange
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
        if @state.src
          div { className: 'esi-preview' },
            img {
              className: 'esi-image'
              src: if @state.progress then @state.src else resize(@state.src, width: 900)
              style: opacity: if @state.progress then @state.progress else '1'
              key: 0
            }
            div {
              className: 'esi-inline-caption'
              dangerouslySetInnerHTML: __html: @state.caption
              key: 1
            }
        else
          div { className: 'esi-placeholder' }, 'Add an image above'
      )
