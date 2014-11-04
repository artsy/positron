#
# Artworks section that shows artwork images in various layouts. A user can
# add artworks from urls or search via autocomplete.
#

_ = require 'underscore'
Artworks = require '../../../../collections/artworks.coffee'
React = require 'react'
ByTitle = require './by_title.coffee'
imagesLoaded = require 'imagesloaded'
{ div, nav, section, label, input, a, h1, textarea, button, form, ul,
  li, img, p, strong, span } = React.DOM
icons = -> require('./icons.jade') arguments...

ROW_OVERFLOW_PADDING = 20

module.exports = React.createClass

  getInitialState: ->
    urlsValue: ''
    artworks: []
    loadingUrls: false

  componentDidMount: ->
    ids = @props.section.get('ids')
    return if not ids?.length or @state.artworks.length
    @fetchArtworks ids

  componentDidUpdate: ->
    return unless @state.artworks.length
    if @props.section.get('layout') is 'overflow_fillwidth'
      @fillwidth()
    else
      @removeFillwidth()

  fillwidth: ->
    $list = $(@refs.artworks.getDOMNode())
    $imgs = $list.find('img')
    imagesLoaded $list[0], =>
      widths = $imgs.map -> $(this).width()
      sum = _.reduce widths, (m, n) -> m + n
      return unless sum > listWidth = $list.width()
      newWidths = _.map widths, (w) -> Math.round w * (listWidth / sum)
      $list.children('li').each (i) ->
        $(this).width newWidths[i] - ROW_OVERFLOW_PADDING
      tallest = _.max $imgs.map -> $(this).height()
      $list.find('.esa-img-container').each -> $(this).height tallest

  removeFillwidth: ->
    $(@refs.artworks.getDOMNode()).children('li').each ->
      $(this).width('auto').find('.esa-img-container').height 'auto'

  onClickOff: ->
    ids = (artwork.artwork.id for artwork in @state.artworks)
    return @props.section.destroy() if ids.length is 0
    @props.section.set ids: ids, layout: @props.section.get('layout')

  addArtworksFromUrls: (e) ->
    e.preventDefault()
    slugs = (_.last(url.split '/') for url in @state.urlsValue.split '\n')
    @fetchArtworks slugs
    @props.section.set ids: _.pluck @state.artworks, 'id'

  fetchArtworks: (ids) ->
    @setState loadingUrls: true
    @props.section.artworks.getOrFetchIds ids,
      success: (artworks) =>
        return unless @isMounted()
        @setState
          artworks: artworks.toJSON()
          loadingUrls: false

  removeArtwork: (artwork) -> =>
    @setState artworks: _.without @state.artworks, artwork

  addArtwork: (artwork) ->
    @setState artworks: @state.artworks.concat [artwork]

  onChangeUrls: (e) ->
    @setState urlsValue: e.target.value

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
              div { className: 'esa-img-container' },
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
