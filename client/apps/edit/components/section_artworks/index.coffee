#
# Text section that display large bodies of copy and can split itself
# between empty paragraphs to insert a new section.
#

_ = require 'underscore'
React = require 'react'
{ div, nav, section, label, input, a, h1, textarea, button, form, ul,
  li, img, p, strong } = React.DOM
icons = -> require('./icons.jade') arguments...

ARTWORKS_FIXTURE = [
  { id: '4d8b93ba4eb68a1b2c001c5b', title: 'Skull', artist_name: 'Andy Warhol', partner_name: 'Gagosian Gallery', image_url: 'http://static0.artsy.net/additional_images/4e68f259528702000104c329/1/large.jpg' }
  { id: '524a87b98b3b81abd0000ecc', title: 'Dolde 1', artist_name: 'Tracey Emin', partner_name: 'White Cube', image_url: 'http://static1.artsy.net/additional_images/524a88458b3b81abd0000ed5/large.jpg' }
]

module.exports = React.createClass

  getInitialState: ->
    { urlsValue: '', artworks: [] }

  addArtworksFromUrls: (e) ->
    e.preventDefault()
    # slugs = (_.last(url.split '/') for url in @state.urlsValue.split '\n')
    # TODO: Add local API endpoint that converts urls into artwork json. We'd
    # do this in the browser, but CORS doesn't allow redirection so when we go
    # from /artworks/:slug to /artworks/:_id we get a CORS error.
    @setState artworks: ARTWORKS_FIXTURE
    @props.section.set ids: _.pluck @state.artworks, 'id'

  removeArtwork: (artwork) -> =>
    @setState artworks: _.without @state.artworks, artwork

  onChangeUrls: (e) ->
    @setState urlsValue: e.target.value

  render: ->
    div {
      className: 'edit-section-artworks-container'
      'data-layout': @props.section.get('layout')
    },
      div { className: 'esa-controls-container' },
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
          label {}, 'Search by title',
            input {
              placeholder: 'Try “Andy Warhol Skull”'
              className: 'bordered-input'
            }
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
              }, 'Add artworks from urls'
      (if @state.artworks.length
        ul { className: 'esa-artworks-list', ref: 'artworks' },
          (for artwork, i in @state.artworks
            li { key: i },
              img { src: artwork.image_url }
              p {},
                strong {}, artwork.artist_name
              p {}, artwork.title
              p {}, artwork.partner_name
              button {
                className: 'edit-section-remove button-reset'
                dangerouslySetInnerHTML: __html: $(icons()).filter('.remove').html()
                onClick: @removeArtwork(artwork)
              }
          )
      else
        div { className: 'esa-empty-placeholder' }, 'Add artworks above'
      )
