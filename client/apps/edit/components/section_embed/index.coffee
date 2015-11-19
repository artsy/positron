#
# Artworks section that shows artwork images in various layouts. A user can
# add artworks from urls or search via autocomplete.
#

_ = require 'underscore'
Artworks = require '../../../../collections/artworks.coffee'
Artwork = require '../../../../models/artwork.coffee'
React = require 'react'
sd = require('sharify').data
{ div, section, label, nav, input, a, h1, p, strong, span, form, button, iframe } = React.DOM
icons = -> require('./icons.jade') arguments...

module.exports = React.createClass

  getInitialState: ->
    errorMessage: ''
    src: ''
    height: ''

  componentDidMount: ->
    src = @props.section.get('src')
    @renderEmbeddedContent src if src

  onClickOff: ->
    return @props.section.destroy() if @state.src is ''

  renderIframe: (src, height) ->
    @setState src: src, height: height
    @forceUpdate()
    @setState loading: false

  submitIframe: (e) ->
    e.preventDefault()
    src = @refs.url.getDOMNode().value
    height = @refs.height.getDOMNode().value
    @setState loading: true
    @renderIframe src, height

  removeIframe: ->
    @setState src: ''
    @forceUpdate()

  # toggleFillwidth: ->
  #   return unless @props.section.artworks.length
  #   if @props.section.get('layout') is 'overflow_fillwidth'
  #     @removeFillwidth() if @prevLength isnt @props.section.artworks.length
  #     @fillwidth()
  #   else if @props.section.previous('layout') isnt @props.section.get('layout')
  #     @removeFillwidth()
  #   @prevLength = @props.section.artworks.length

  # fillwidth: ->
  #   len = $(@refs.artworks.getDOMNode()).find('img').length
  #   $(@refs.artworks.getDOMNode()).fillwidthLite
  #     gutterSize: 20
  #     apply: (img, i) ->
  #       pad = switch i
  #         when 0 then '0 20px 0 0'
  #         when len - 1 then '0 0 0 20px'
  #         else '0 10px'
  #       img.$el.closest('li').css(padding: pad).width(img.width)

  # removeFillwidth: ->
  #   $(@refs.artworks.getDOMNode()).find('li').css(width: '', padding: '')

  changeLayout: (layout) -> =>
    console.log 'changing layout to' + layout
    @props.section.set layout: layout

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
            onClick: @changeLayout('overflow_tall')
          }
          a {
            style: {
              'background-image': 'url(/icons/edit_artworks_overflow_fillwidth.svg)'
              'background-size': '38px'
            }
            className: 'esa-overflow-fillwidth'
            onClick: @changeLayout('overflow_short')
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
          h1 {}, 'Add a embedded content to this section'
          div {
            className: 'ese-iframe-error'
            dangerouslySetInnerHTML: __html: @state.errorMessage
          }
          form {
            className: 'ese-input-form-container'
            onSubmit: @submitIframe
          },
            div { className: 'ese-input' }, "URL",
              input {
                placeholder: 'http://files.artsy.net'
                className: 'bordered-input bordered-input-dark'
                ref: 'url'
              }
            div { className: 'ese-input' }, "Height",
              input {
                className: 'bordered-input bordered-input-dark'
                placeholder: '400'
                ref: 'height'
              }
            button {
              className: 'avant-garde-button avant-garde-button-dark'
              'data-state': if @state.loading then 'loading' else ''
            }, 'Add URL'
      (if @state.src is ''
        div { className: 'ese-empty-placeholder' }, 'Add URL above'
      else
        div { className: 'ese-embed-content' },
          iframe {
            src: @state.src
            style: { 'height': @state.height }
            className: 'embed-iframe'
            scrolling: 'no'
            frameborder: '0'
            ref: 'iframe'
          }
          button {
            className: 'edit-section-remove button-reset'
            dangerouslySetInnerHTML: __html: $(icons()).filter('.remove').html()
            onClick: @removeIframe
          }
      )
