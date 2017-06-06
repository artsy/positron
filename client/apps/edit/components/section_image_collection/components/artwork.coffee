React = require 'react'
icons = -> require('../icons.jade') arguments...
{ div, span, img, button, p, strong } = React.DOM

module.exports = React.createClass
  displayName: 'ImageCollectionDisplayArtwork'

  formatArtistNames: (artwork) ->
    if artwork.artists?[0]
      names = artwork.artists.map (artist) ->
        artist.name
      names.join ', '
    else
      artwork.artist?.name

  render: ->
    artwork = @props.artwork

    div { className: 'esic-img-container' },
      img {
        src: artwork.image
        className: 'esic-artwork'
      }
      div {
        className: 'esic-caption'
      },
        p {},
          strong {}, @formatArtistNames artwork
        p {},
          span { className: 'title' }, artwork.title if artwork.title
          span { className: 'date' }, ", " + artwork.date if artwork.date
        p {}, artwork.partner.name if artwork.partner.name
      button {
        className: 'edit-section-remove button-reset esic-img-remove'
        onClick: @props.removeItem(artwork)
        dangerouslySetInnerHTML: __html: $(icons()).filter('.remove').html()
      }