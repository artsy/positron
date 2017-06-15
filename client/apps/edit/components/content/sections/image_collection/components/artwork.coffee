React = require 'react'
icons = -> require('../../../../icons.jade') arguments...
{ div, span, img, button, p, strong } = React.DOM
DisplayArtwork = React.createFactory require('particle2').DisplayArtwork

module.exports = React.createClass
  displayName: 'ImageCollectionDisplayArtwork'

  render: ->
    artwork = @props.artwork

    DisplayArtwork {
      artwork: artwork
    }
    # div { className: 'esic-img-container' },
    #   img {
    #     src: artwork.image
    #     className: 'esic-artwork'
    #   }
    #   div {
    #     className: 'esic-caption'
    #   },
    #     p {},
    #       strong {}, @formatArtistNames artwork
    #     p {},
    #       span { className: 'title' }, artwork.title if artwork.title
    #       span { className: 'date' }, ", " + artwork.date if artwork.date
    #     p {}, artwork.partner.name if artwork.partner.name
    #   button {
    #     className: 'edit-section-remove button-reset esic-img-remove'
    #     onClick: @props.removeItem(artwork)
    #     dangerouslySetInnerHTML: __html: $(icons()).filter('.remove').html()
    #   }