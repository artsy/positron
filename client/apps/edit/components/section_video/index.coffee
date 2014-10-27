#
# Image section that allows uploading large overflowing images.
#

_ = require 'underscore'
gemup = require 'gemup'
React = require 'react'
sd = require('sharify').data
{ section, h1, header, input } = React.DOM

module.exports = React.createClass

  getInitialState: ->
    { src: @props.section.get('url'), progress: null }

  onClickOff: ->
    if @props.section.get('url')
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
        image.onload = => @setState src: src, progress: null

  render: ->
    section { className: 'edit-section-image' },
      header { className: 'edit-section-controls' },
        h1 {}, "Paste the url of a video on Vimeo or YouTube" + 
          'to replace this video' if @state.src
        input { placeholder: 'http://youtu.be/embed-code' }
        button {
          className: 'avant-garde-button avant-garde-button-dark'
        }, 'Embed'
      div { className: 'esv-placeholder' }, ''
