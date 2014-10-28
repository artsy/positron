#
# Image section that allows uploading large overflowing images.
#

_ = require 'underscore'
gemup = require 'gemup'
React = require 'react'
sd = require('sharify').data
{ section, h1, header, input, button, div, iframe, form } = React.DOM

module.exports = React.createClass

  getInitialState: ->
    { src: @props.section.get('url') }

  onClickOff: ->
    if @state.src
      @props.section.set url: @state.src
    else
      @props.section.destroy()

  componentDidMount: ->
    $(@refs.input.getDOMNode()).focus() unless @props.section.get('url')

  onSubmit: (e) ->
    e.preventDefault()
    @setState src: $(@refs.input.getDOMNode()).val()

  getIframeUrl: ->
    if @state.src.match 'youtu'
      id = _.last @state.src.split '/'
      id = id.split('?v=')[1] if id.match 'watch'
      "//www.youtube.com/embed/#{id}"
    else if @state.src.match 'vimeo'
      id = _.last @state.src.split '/'
      "//player.vimeo.com/video/#{id}?color=ffffff"

  render: ->
    section { className: 'edit-section-video' },
      header { className: 'edit-section-controls' },
        h1 {}, ("Paste the url of a video on Vimeo or YouTube" +
          (if @state.src then ' to replace this video' else ''))
        form { onSubmit: @onSubmit },
          input {
            className: 'bordered-input'
            placeholder: 'http://youtu.be/share-url'
            ref: 'input'
            defaultValue: @state.src
          }
          button {
            className: 'avant-garde-button avant-garde-button-dark'
          }, 'Embed'
      (
        if @state.src
          iframe { src: @getIframeUrl(), width: '100%', height: '313px' }
        else
          div { className: 'esv-placeholder' }, 'Add a video above'
      )
