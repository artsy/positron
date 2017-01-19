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
    @autocomplete.remove()

  componentDidUpdate: ->
    @toggleFillwidth()

  setupAutocomplete: ->
    $el = $(@refs.autocomplete.getDOMNode())
    @autocomplete = new Autocomplete
      url: "#{sd.ARTSY_URL}/api/search?q=%QUERY"
      el: $el
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
    _.defer -> $el.focus()

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
    if $(@refs.artworks.getDOMNode()).find('img').length > 1
      $(@refs.artworks.getDOMNode()).fillwidthLite
        gutterSize: 20
        apply: (img, i) ->
          img.$el.closest('li').width(img.width)

  removeFillwidth: ->
    $(@refs.artworks.getDOMNode()).find('li').css(width: '', padding: '')

  onClickOff: ->
    return @props.section.destroy() if @props.section.artworks.length is 0

  removeArtwork: (artwork) -> =>
    @props.section.artworks.remove artwork

  changeLayout: (layout) -> =>
    @props.section.set layout: layout

  fetchArtworks: (ids, callback) ->
    @props.section.artworks.getOrFetchIds ids,
      error: (m, res) =>
        @refs.byUrls.setState(
          errorMessage: 'Artwork not found. Make sure your urls are correct.'
          loadingUrls: false
        ) if res.status is 404
      success: (artworks) =>
        return unless @isMounted()
        @refs.byUrls.setState loading: false, errorMessage: ''
        callback?()

  formatArtistNames: (artwork) ->
    if artwork.get('artists')?[0]
      names = artwork.get('artists').map (artist) ->
        artist.name
      names.join ', '

  render: ->
    div {
      className: 'edit-section-artworks-container'
      onClick: @props.setEditing(on)
    },
      div { className: 'esa-controls-container edit-section-controls' },
        nav {},
          a {
            style: {
              'backgroundImage': 'url(/icons/edit_artworks_overflow_fillwidth.svg)'
              'backgroundSize': '38px'
            }
            className: 'esa-overflow-fillwidth'
            onClick: @changeLayout('overflow_fillwidth')
          }
          a {
            style: {
              'backgroundImage': 'url(/icons/edit_artworks_column_width.svg)'
              'backgroundSize': '22px'
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
                img { src: artwork.defaultImage().bestImageUrl(['larger', 'large', 'medium', 'small']) }
              p {},
                strong {}, @formatArtistNames artwork
              p { className: 'title' }, artwork.get('artwork')?.title or artwork.attributes?.title,
                if artwork.get('date')
                  span { className: 'date' }, ", " + artwork.get('date')
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
