#
# Artworks section that shows artwork images in various layouts. A user can
# add artworks from urls or search via autocomplete.
#

_ = require 'underscore'
Artworks = require '../../../../collections/artworks.coffee'
Artwork = require '../../../../models/artwork.coffee'
React = require 'react'
sd = require('sharify').data
{ oembed } = require('embedly-view-helpers')(sd.EMBEDLY_KEY)
{ div, section, label, nav, input, a, h1, p, strong, span, form, button, iframe } = React.DOM
icons = -> require('./icons.jade') arguments...

module.exports = React.createClass

  getInitialState: ->
    errorMessage: ''
    src: ''
    embeddable: ''
    iframe: ''

  componentDidMount: ->
    src = @props.section.get('src')
    @updateIframe src if src

  onClickOff: ->
    return @props.section.destroy() if @state.src is ''

  submitSrc: (e) ->
    e.preventDefault()
    src = @refs.url.getDOMNode().value
    @setState loading: true
    @updateIframe src

  updateIframe: (src) ->
    $.get oembed(src, { maxwidth: @getWidth() }), (response) =>
      @setState iframe: response.html if response.html
      @setState src: src, embeddable: @state.iframe?.length > 0
      @forceUpdate()
      @setState loading: false

  removeIframe: ->
    @setState src: ''
    @forceUpdate()

  changeLayout: (layout) -> =>
    console.log 'changing layout to' + layout
    @props.section.set layout: layout
    @toggleFillwidth()

  toggleFillwidth: ->
    # if @props.section.get('layout') is 'overflow'
    #   # Fill Width
    #   $(@refs.embed.getDOMNode()).css( width: 1100 )
    # else
    #   # Column width
    #   $(@refs.embed.getDOMNode()).css( width: 500)
    @updateIframe(@state.src)

  getWidth: ->
    if @props.section.get('layout') is 'overflow' then 860 else 500

  render: ->
    div {
      className: 'edit-section-embed-container'
      onClick: @props.setEditing(on)
    },
      div { className: 'ese-controls-container edit-section-controls' },
        nav {},
          a {
            style: {
              'background-image': 'url(/icons/edit_artworks_overflow_fillwidth.svg)'
              'background-size': '38px'
            }
            className: 'esa-overflow-fillwidth'
            onClick: @changeLayout('overflow')
          }
          a {
            style: {
              'background-image': 'url(/icons/edit_artworks_column_width.svg)'
              'background-size': '22px'
            }
            className: 'esa-column-width'
            onClick: @changeLayout('column_width')
        }
        section { className: 'ese-inputs' },
          h1 {}, 'Add embedded content to this section'
          div {
            className: 'ese-iframe-error'
            dangerouslySetInnerHTML: __html: @state.errorMessage
          }
          form {
            className: 'ese-input-form-container'
            onSubmit: @submitSrc
          },
            div { className: 'ese-input' }, "URL",
              input {
                placeholder: 'http://files.artsy.net'
                className: 'bordered-input bordered-input-dark'
                ref: 'url'
              }
            button {
              className: 'avant-garde-button avant-garde-button-dark'
              'data-state': if @state.loading then 'loading' else ''
            }, 'Add URL'
      div { className: 'embed-container', ref: 'embed' },
        (if @state.src is ''
          div { className: 'ese-empty-placeholder' }, 'Add URL above'
        else if @state.embeddable and @state.iframe
          [
            div {
              className: 'ese-embed-content'
              dangerouslySetInnerHTML: __html: @state.iframe
            }
            button {
              className: 'edit-section-remove button-reset'
              dangerouslySetInnerHTML: __html: $(icons()).filter('.remove').html()
              onClick: @removeIframe
            }
          ]
        else
          [
            div {
              className: 'ese-embed-content'
            },
              iframe {
                src: @state.src
                className: 'embed-iframe'
                scrolling: 'no'
                frameborder: '0'
              }
            button {
              className: 'edit-section-remove button-reset'
              dangerouslySetInnerHTML: __html: $(icons()).filter('.remove').html()
              onClick: @removeIframe
            }
          ]
        )
