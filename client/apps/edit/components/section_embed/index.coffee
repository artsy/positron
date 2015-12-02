#
# Artworks section that shows artwork images in various layouts. A user can
# add artworks from urls or search via autocomplete.
#

_ = require 'underscore'
React = require 'react'
sd = require('sharify').data
{ oembed } = require('embedly-view-helpers')(sd.EMBEDLY_KEY)
{ div, section, label, nav, input, a, h1, p, strong, span, form, button, iframe } = React.DOM

module.exports = React.createClass

  getInitialState: ->
    errorMessage: ''
    url: @props.section.get('url')
    embeddable: null
    iframe: ''
    height: @props.section.get('height')

  componentDidMount: ->
    url = @props.section.get('url')
    height = @props.section.get('height') or ''
    @updateIframe url, height if url

  onClickOff: ->
    return @props.section.destroy() if @state.url is ''

  submitUrl: (e) ->
    e.preventDefault()
    url = @refs.url.getDOMNode().value
    height = @refs.height.getDOMNode().value
    @props.section.set url: url, height: height
    @setState loading: true
    @updateIframe url, height

  updateIframe: (url, height = '') ->
    $.get oembed(url, { maxwidth: @getWidth() }), (response) =>
      @setState iframe: response.html if response.html
      @setState url: url, height: height, embeddable: response.html?
      @forceUpdate()
      @setState loading: false

  changeLayout: (layout) -> =>
    @props.section.set layout: layout
    @updateIframe(@state.url, @state.height)

  getWidth: ->
    if @props.section.get('layout') is 'overflow' then 1060 else 500

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
            className: 'ese-overflow'
            onClick: @changeLayout('overflow')
          }
          a {
            style: {
              'background-image': 'url(/icons/edit_artworks_column_width.svg)'
              'background-size': '22px'
            }
            className: 'ese-column-width'
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
            onSubmit: @submitUrl
          },
            div { className: 'ese-input' }, "URL",
              input {
                placeholder: 'http://files.artsy.net'
                className: 'bordered-input bordered-input-dark'
                ref: 'url'
                value: @props.section.get('url')
              },
            div { className: 'ese-input' }, "Height (optional)",
              input {
                placeholder: '400'
                className: 'bordered-input bordered-input-dark'
                ref: 'height'
                value: @props.section.get('height')
              }
            button {
              className: 'avant-garde-button avant-garde-button-dark'
              'data-state': if @state.loading then 'loading' else ''
            }, 'Add URL'
      div {
        className: 'embed-container'
        ref: 'embed'
      }
        (if @state.url is ''
          div { className: 'ese-empty-placeholder' }, 'Add URL above'
        else if @state.embeddable and @state.iframe
          div {
            className: 'ese-embed-content'
            dangerouslySetInnerHTML: __html: @state.iframe
            style: { 'height': @state.height if @state.height.length }
          }
        else
          div {
            className: 'ese-embed-content'
          },
            iframe {
              src: @state.url
              className: 'embed-iframe'
              scrolling: 'no'
              frameborder: '0'
              style: { 'height': @state.height if @state.height.length }
            }
        )
