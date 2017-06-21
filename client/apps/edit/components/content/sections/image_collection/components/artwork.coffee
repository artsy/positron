React = require 'react'
components = require('@artsy/reaction-force/dist/components/publishing/index').default
Artwork = React.createFactory components.Artwork
icons = -> require('../../../../icons.jade') arguments...
{ div, span, img, button, p, strong } = React.DOM

module.exports = React.createClass
  displayName: 'ImageCollectionDisplayArtwork'

  render: ->
    div { className: 'esic-img-container'},
      Artwork {
        artwork: @props.artwork
      }
      button {
        className: 'edit-section-remove button-reset esic-img-remove'
        onClick: @props.removeItem(@props.artwork)
        dangerouslySetInnerHTML: __html: $(icons()).filter('.remove').html()
      }

