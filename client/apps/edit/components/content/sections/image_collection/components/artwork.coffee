React = require 'react'
icons = -> require('../../../../icons.jade') arguments...
{ div, span, img, button, p, strong } = React.DOM
DisplayArtwork = React.createFactory require('particle2').DisplayArtwork

module.exports = React.createClass
  displayName: 'ImageCollectionDisplayArtwork'

  render: ->
    artwork = @props.artwork

    div { className: 'esic-img-container'},
      DisplayArtwork {
        artwork: artwork
      }
      button {
        className: 'edit-section-remove button-reset esic-img-remove'
        onClick: @props.removeItem(artwork)
        dangerouslySetInnerHTML: __html: $(icons()).filter('.remove').html()
      }
