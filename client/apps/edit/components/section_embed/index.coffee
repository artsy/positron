#
# Artworks section that shows artwork images in various layouts. A user can
# add artworks from urls or search via autocomplete.
#

_ = require 'underscore'
Artworks = require '../../../../collections/artworks.coffee'
Artwork = require '../../../../models/artwork.coffee'
React = require 'react'
sd = require('sharify').data
{ div, section, label, input, a, h1, p, strong, span, form, button } = React.DOM
icons = -> require('./icons.jade') arguments...

ROW_OVERFLOW_PADDING = 20

module.exports = React.createClass

  getInitialState: ->
    url: ''
    errorMessage: ''

  componentDidMount: ->
    url = @props.section.get('url')
    @renderEmbeddedContent url if url

  onClickOff: ->
    return @props.section.destroy() if @props.section.get('url') is ''

  renderEmbeddedContent: (url) ->
    # render a valid url

  submitEmbeddedContent: (e) ->
    e.preventDefault()
    val = @refs.input.getDOMNode().value
    @setState loading: true
    # Check if url is valid
    @renderEmbeddedContent val

  render: ->
    div {
      className: 'edit-section-embed-container'
      onClick: @props.setEditing(on)
    },
      div { className: 'ese-controls-container edit-section-controls' },
        section { className: 'ese-inputs' },
          h1 {}, 'Add an embedable URL to this section'
          div {
            className: 'ese-url-error'
            dangerouslySetInnerHTML: __html: @state.errorMessage
          }
          form {
            className: 'ese-by-url-container'
            onSubmit: @submitEmbeddedContent
          },
            input {
              placeholder: 'http://google.com'
              className: 'bordered-input bordered-input-dark'
              ref: 'input'
            }
            button {
              className: 'avant-garde-button avant-garde-button-dark'
              'data-state': if @state.loading then 'loading' else ''
            }, 'Add content from url'
      (if @props.section.url is not ''
        div { className: 'embed-content', ref: 'url' },
          @props.section.url
      else
        div { className: 'ese-empty-placeholder' }, 'Add embeddable link above'
      )
