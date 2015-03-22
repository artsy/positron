#
# Artworks section that shows artwork images in various layouts. A user can
# add artworks from urls or search via autocomplete.
#

_ = require 'underscore'
Artworks = require '../../../../collections/artworks.coffee'
Artwork = require '../../../../models/artwork.coffee'
React = require 'react'
ByUrls = React.createFactory require './by_urls.coffee'
imagesLoaded = require 'imagesloaded'
sd = require('sharify').data
Autocomplete = require '../../../../components/autocomplete/index.coffee'
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
    @setupAutocomplete()

  componentWillUnmount: ->
    @props.section.artworks.off()
    @autocomplete.remove()

  componentDidUpdate: ->
    @toggleFillwidth()

  setupAutocomplete: ->
    @autocomplete = new Autocomplete
      url: "#{sd.ARTSY_URL}/api/search?q=%QUERY"
      el: $(@refs.autocomplete.getDOMNode())
      filter: (res) ->
        vals = []
        for r in res._embedded.results
          if r.type == 'Artwork'
            id = r._links.self.href.substr(r._links.self.href.lastIndexOf('/') + 1)
            vals.push
              id: id
              value: r.title
              thumbnail: r._links.thumbnail.href
        return vals
      templates:
        suggestion: (data) ->
          """
            <div class='esa-suggestion' \
                 style='background-image: url(#{data.thumbnail})'>
            </div>
            #{data.value}
          """
      selected: @onSelect

  onSelect: (e, selected) ->
    new Artwork(id: selected.id).fetch
      success: (artwork) =>
        @props.section.artworks.add artwork
    $(@refs.autocomplete.getDOMNode()).val('').focus()

  toggleFillwidth: ->
    return unless @props.section.artworks.length
    if @props.section.get('layout') is 'overflow_fillwidth'
      @removeFillwidth() if @prevLength isnt @props.section.artworks.length
      @fillwidth()
    else if @props.section.previous('layout') isnt @props.section.get('layout')
      @removeFillwidth()
    @prevLength = @props.section.artworks.length

  fillwidth: ->
    len = $(@refs.artworks.getDOMNode()).find('img').length
    $(@refs.artworks.getDOMNode()).fillwidthLite
      gutterSize: 20
      apply: (img, i) ->
        pad = switch i
          when 0 then '0 20px 0 0'
          when len - 1 then '0 0 0 20px'
          else '0 10px'
        img.$el.closest('li').css(padding: pad).width(img.width)

  removeFillwidth: ->
    $(@refs.artworks.getDOMNode()).find('img').css(width: '')

  onClickOff: ->
    ids = @props.section.artworks.pluck 'id'
    return @props.section.destroy() if ids.length is 0
    @props.section.set ids: ids, layout: @props.section.get('layout')

  removeArtwork: (artwork) -> =>
    @props.section.artworks.remove artwork

  changeLayout: (layout) -> =>
    @props.section.set layout: layout

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
          label { className: 'esa-autocomplete-label' }, 'Search by title',
          div { className: 'esa-autocomplete-input' },
            input {
              ref: 'autocomplete'
              className: 'bordered-input bordered-input-dark'
              placeholder: 'Try "Andy Warhol Skull"'
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
                img { src: artwork.imageUrl() }
              p {},
                strong {}, artwork.get('artists')?[0]?.name
              p {}, artwork.get('artwork')?.title or artwork.attributes?.title
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
