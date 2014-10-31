#
# Artworks section that shows artwork images in various layouts. A user can
# add artworks from urls or search via autocomplete.
#

_ = require 'underscore'
Artworks = require '../../../../collections/artworks.coffee'
React = require 'react'
ByTitle = require './by_title.coffee'
{ div, nav, section, label, input, a, h1, textarea, button, form, ul,
  li, img, p, strong, span } = React.DOM
icons = -> require('./icons.jade') arguments...

module.exports = React.createClass

  getInitialState: ->
    urlsValue: ''
    artworks: []
    loadingUrls: false

  componentDidMount: ->
    ids = @props.section.get('ids')
    return if not ids?.length or @state.artworks.length
    @fetchArtworks ids

  onClickOff: ->
    ids = (artwork.artwork.id for artwork in @state.artworks)
    return @props.section.destroy() if ids.length is 0
    @props.section.set ids: ids

  addArtworksFromUrls: (e) ->
    e.preventDefault()
    slugs = (_.last(url.split '/') for url in @state.urlsValue.split '\n')
    @fetchArtworks slugs
    @props.section.set ids: _.pluck @state.artworks, 'id'

  fetchArtworks: (ids) ->
    @setState loadingUrls: true
    new Artworks().fetch
      data: ids: ids
      success: (artworks, res) =>
        return unless @isMounted()
        @setState
          artworks: @state.artworks.concat res
          loadingUrls: false

  removeArtwork: (artwork) -> =>
    @setState artworks: _.without @state.artworks, artwork

  addArtwork: (artwork) ->
    @setState artworks: @state.artworks.concat [artwork]

  onChangeUrls: (e) ->
    @setState urlsValue: e.target.value

  render: ->
    div {
      className: 'edit-section-artworks-container'
      'data-layout': @props.section.get('layout')
      onClick: @props.setEditing(on)
    },
      div { className: 'esa-controls-container edit-section-controls' },
        nav {},
          a {
            style: {
              'background-image': 'url(/icons/edit_artworks_overflow_fillwidth.svg)'
              'background-size': '38px'
            }
            className: 'esa-overflow-fillwidth'
          }
          a {
            style: {
              'background-image': 'url(/icons/edit_artworks_column_width.svg)'
              'background-size': '22px'
            }
            className: 'esa-column-width'
        }
        section { className: 'esa-inputs' },
          h1 {}, 'Add artworks to this section'
          ByTitle { addArtwork: @addArtwork }
          label {}, 'or paste in artwork page urls',
            form {
              className: 'esa-by-urls-container'
              onSubmit: @addArtworksFromUrls
            },
              textarea {
                placeholder: ('http://artsy.net/artwork/andy-warhol-skull\n' +
                              'http://artsy.net/artwork/tracey-emin-dolde')
                className: 'bordered-input'
                value: @state.urlsValue
                onChange: @onChangeUrls
                rows: 3
              }
              button {
                className: 'avant-garde-button avant-garde-button-dark'
                'data-state': if @state.loadingUrls then 'loading' else ''
              }, 'Add artworks from urls'
      (if @state.artworks.length
        ul { className: 'esa-artworks-list', ref: 'artworks' },
          (for artwork, i in @state.artworks
            li { key: i },
              img { src: artwork.image_urls.large }
              p {},
                strong {}, artwork.artists?[0]?.name
              p {}, artwork.artwork.title
              p {}, artwork.partner?.name
              button {
                className: 'edit-section-remove button-reset'
                dangerouslySetInnerHTML: __html: $(icons()).filter('.remove').html()
                onClick: @removeArtwork(artwork)
              }
          )
      else if @state.loadingUrls
        div { className: 'esa-spinner-container' },
          div { className: 'loading-spinner' }
      else
        div { className: 'esa-empty-placeholder' }, 'Add artworks above'
      )
