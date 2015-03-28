#
# Image section that allows uploading large overflowing images.
#

_ = require 'underscore'
gemup = require 'gemup'
React = require 'react'
{ getIframeUrl } = require '../../../../models/section.coffee'
sd = require('sharify').data
{ section, h1, header, input, button, div, iframe, form } = React.DOM

module.exports = React.createClass

  componentDidMount: ->
    @props.section.on 'change:url', => @forceUpdate()

  onClickOff: ->
    @props.section.destroy() unless @props.section.get('url')

  componentDidMount: ->
    $(@refs.input.getDOMNode()).focus() unless @props.section.get('url')

  onSubmit: (e) ->
    e.preventDefault()
    @props.section.set url: $(@refs.input.getDOMNode()).val()
    @props.setEditing(off)()

  render: ->
    section { className: 'edit-section-video' },
      header { className: 'edit-section-controls' },
        h1 {}, ("Paste the url of a video on Vimeo or YouTube" +
          (if @props.section.get('url') then ' to replace this video' else ''))
        form { onSubmit: @onSubmit },
          input {
            className: 'bordered-input bordered-input-dark'
            placeholder: 'http://youtu.be/share-url'
            ref: 'input'
            defaultValue: @props.section.get('url')
          }
          button {
            className: 'avant-garde-button avant-garde-button-dark'
          }, 'Embed'
      (
        if @props.section.get('url')
          iframe {
            src: getIframeUrl(@props.section.get 'url')
            width: '100%'
            height: '313px'
          }
        else
          div { className: 'esv-placeholder' }, 'Add a video above'
      )
