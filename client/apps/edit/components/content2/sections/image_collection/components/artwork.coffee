React = require 'react'
components = require('@artsy/reaction-force/dist/components/publishing/index').default
Artwork = React.createFactory components.Artwork
icons = -> require('../../../../icons.jade') arguments...
{ div, button } = React.DOM

module.exports = React.createClass
  displayName: 'ImageCollectionDisplayArtwork'

  render: ->
    div {
      className: 'image-collection__img-container'
      style: {width: @props.dimensions?[@props.index]?.width or 'auto'}
    },
      Artwork {
        artwork: @props.artwork
        linked: false
        layout: 'classic' if @props.article?.get('layout') is 'classic'
      }
      if @props.removeItem and @props.editing
        button {
          className: 'edit-section-remove button-reset'
          onClick: @props.removeItem(@props.artwork)
          dangerouslySetInnerHTML: __html: $(icons()).filter('.remove').html()
        }
