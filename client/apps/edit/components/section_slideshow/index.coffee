#
# Slideshow section that appears at the top of a post. Used mainly as a way
# to drop in in migrated posts.
#

_ = require 'underscore'
React = require 'react'
imagesLoaded = require 'imagesloaded'
{ getIframeUrl } = require '../../../../models/section.coffee'
{ div, section, ul, li, img, p, strong, iframe } = React.DOM

module.exports = React.createClass

  componentDidMount: ->
    @props.section.fetchSlideshowArtworks success: => @forceUpdate()
    @lockWidths()

  componentDidUpdate: ->
    @lockWidths()

  lockWidths: ->
    imagesLoaded @refs.list.getDOMNode(), =>
      width = 0
      $(@refs.list.getDOMNode()).children('li').each ->
        $(this).width $(this).find('img').width()
        width += $(this).outerWidth(true)
      $(@refs.list.getDOMNode()).width width

  render: ->
    section { className: 'edit-section-slideshow' },
      div { className: 'ess-container', onClick: @props.setEditing(on) },
        ul { className: 'ess-list', ref: 'list' },
          (for item in @props.section.get('items')
            li {},
              (switch item.type
                when 'artwork'
                  (
                    if (artwork = @props.section.artworks.findWhere _id: item.id)?
                      [
                        img { src: artwork.imageUrl() }
                        div { className: 'ess-artwork-details' },
                          p {},
                            strong {}, artwork.get('artist').name
                          p {}, artwork.get('title')
                          p {}, artwork.get('partner')?.name
                      ]
                    else
                      div { className: 'ess-loading-artwork' },
                        div { className: 'loading-spinner' }
                  )
                when 'image'
                  img { src: item.url }
                when 'video'
                  iframe {
                    src: getIframeUrl(item.url)
                    height: '500px'
                    width: '888px'
                  }
              )
          )
