#
# Artworks section that shows artwork images in various layouts. A user can
# add artworks from urls or search via autocomplete.
#

_ = require 'underscore'
Artworks = require '../../../../collections/artworks.coffee'
React = require 'react'
{ div, label, textarea, button, form } = React.DOM

module.exports = React.createClass

  getInitialState: ->
    { loading: false, errorMessage: [] }

  addArtworksFromUrls: (e) ->
    e.preventDefault()
    val = @refs.textarea.getDOMNode().value
    slugs = (_.last(url.split '/') for url in val.split '\n')
    @setState loading: true
    @props.fetchArtworks slugs

  render: ->
    label {}, 'or paste in artwork page urls',
      div {
        className: 'esa-urls-error'
        dangerouslySetInnerHTML: __html: @state.errorMessage
      }
      form {
        className: 'esa-by-urls-container'
        onSubmit: @addArtworksFromUrls
      },
        textarea {
          placeholder: ('http://artsy.net/artwork/andy-warhol-skull\n' +
                        'http://artsy.net/artwork/tracey-emin-dolde')
          className: 'bordered-input bordered-input-dark'
          onChange: @onChangeUrls
          ref: 'textarea'
          rows: 3
        }
        button {
          className: 'avant-garde-button avant-garde-button-dark'
          'data-state': if @state.loading then 'loading' else ''
        }, 'Add artworks from urls'
