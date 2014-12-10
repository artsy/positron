#
# Artworks section that shows artwork images in various layouts. A user can
# add artworks from urls or search via autocomplete.
#

_ = require 'underscore'
Artworks = require '../../../../collections/artworks.coffee'
React = require 'react'
ByTitle = require './by_title.coffee'
ByUrls = require './by_urls.coffee'
imagesLoaded = require 'imagesloaded'
{ div, nav, section, label, input, a, h1, textarea, button, form, ul,
  li, img, p, strong, span } = React.DOM
icons = -> require('./icons.jade') arguments...

ROW_OVERFLOW_PADDING = 20

module.exports = React.createClass

  getInitialState: ->
    urlsValue: ''
    loadingUrls: true
    errorMessage: ''

  componentDidMount: ->
    ids = @props.section.get('ids')
    @fetchArtworks ids if ids?.length
    @props.section.artworks.on 'add remove', => @forceUpdate()
    @toggleFillwidth()

  componentWillUnmount: ->
    @props.section.artworks.off()

  componentDidUpdate: ->
    @toggleFillwidth()

  toggleFillwidth: ->
    return unless @props.section.artworks.length
    if @props.section.get('layout') is 'overflow_fillwidth'
      @removeFillwidth() if @prevLength isnt @props.section.artworks.length
      @fillwidth()
    else if @props.section.previous('layout') isnt @props.section.get('layout')
      @removeFillwidth()
    @prevLength = @props.section.artworks.length

  fillwidth: ->
    $list = $(@refs.artworks.getDOMNode())
    $imgs = $list.find('img')
    imagesLoaded $list[0], =>
      widths = $imgs.map -> $(this).width()
      sum = _.reduce widths, (m, n) -> m + n
      return unless sum > listWidth = $list.width()
      newWidths = _.map widths, (w) -> Math.floor w * (listWidth / sum)
      $list.children('li').each (i) ->
        $(this).width newWidths[i] - ROW_OVERFLOW_PADDING
      tallest = _.max $imgs.map -> $(this).height()
      $list.find('.esa-img-container').each -> $(this).height tallest

  removeFillwidth: ->
    $list = $(@refs.artworks.getDOMNode())
    $list.css(opacity: 0, height: $list.height()).children('li').each ->
      $(this).width('auto').find('.esa-img-container').height 'auto'
    imagesLoaded $list[0], -> $list.css opacity: 1, height: ''

  onClickOff: ->
    ids = @props.section.artworks.pluck 'id'
    return @props.section.destroy() if ids.length is 0
    @props.section.set ids: ids, layout: @props.section.get('layout')

  fetchArtworks: (ids) ->
    @props.section.artworks.getOrFetchIds ids,
      error: (m, res) =>
        @refs.byUrls.setState(
          errorMessage: 'Artwork not found. Make sure your urls are correct.'
          loadings: false
        ) if res.status is 404
      success: (artworks) =>
        return unless @isMounted()
        @refs.byUrls.setState loading: false, errorMessage: ''

  removeArtwork: (artwork) -> =>
    @props.section.artworks.remove artwork

  changeLayout: (layout) -> =>
    @props.section.set layout: layout

  render: ->
    div {
      className: 'edit-section-artworks-container'
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
            onClick: @changeLayout('overflow_fillwidth')
          }
          a {
            style: {
              'background-image': 'url(/icons/edit_artworks_column_width.svg)'
              'background-size': '22px'
            }
            className: 'esa-column-width'
            onClick: @changeLayout('column_width')
        }
        section { className: 'esa-inputs' },
          h1 {}, 'Add artworks to this section'
          ByTitle {
            artworks: @props.section.artworks
            ref: 'byTitle'
          }
          ByUrls {
            section: @props.section
            fetchArtworks: @fetchArtworks
            ref: 'byUrls'
          }
      (if @props.section.artworks.length
        ul { className: 'esa-artworks-list', ref: 'artworks' },
          (@props.section.artworks.map (artwork, i) =>
            li { key: i },
              div { className: 'esa-img-container' },
                img { src: artwork.get('image_urls')?.large }
              p {},
                strong {}, artwork.get('artists')?[0]?.name
              p {}, artwork.get('artwork')?.title
              p {}, artwork.get('partner')?.name
              button {
                className: 'edit-section-remove button-reset'
                dangerouslySetInnerHTML: __html: $(icons()).filter('.remove').html()
                onClick: @removeArtwork(artwork)
              }
          )
      else if @state.loadingUrls and not @props.editing
        div { className: 'esa-spinner-container' },
          div { className: 'loading-spinner' }
      else
        div { className: 'esa-empty-placeholder' }, 'Add artworks above'
      )
