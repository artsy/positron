#
# Image Set section that allows uploading a mix of images and artworks
#

_ = require 'underscore'
gemup = require 'gemup'
React = require 'react'
sd = require('sharify').data
icons = -> require('./icons.jade') arguments...
Autocomplete = require '../../../../components/autocomplete/index.coffee'
Artwork = require '../../../../models/artwork.coffee'
Input = React.createFactory require './input.coffee'
{ div, section, h1, h2, span, img, header, input, a, button, p, ul, li, strong, nav } = React.DOM
{ resize } = require '../../../../components/resizer/index.coffee'

module.exports = React.createClass

  getInitialState: ->
    images: @props.section.get('images') or []
    layout: @props.section.get('layout') or 'overflow_fillwidth'
    progress: null

  componentDidMount: ->
    @setupAutocomplete()
    @toggleFillwidth() if @state.images.length > 1

  componentWillUnmount: ->
    @autocomplete.remove()

  componentWillUpdate: ->
    @props.section.set
      images: @state.images if @state.images.length > 0
      layout: @state.layout

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
            <div class='esic-suggestion' \
                 style='background-image: url(#{data.thumbnail})'>
            </div>
            #{data.value}
          """
      selected: @onSelect
    _.defer -> $el.focus()

  onSelect: (e, selected) ->
    new Artwork(id: selected.id).fetch
      success: (artwork) =>
        newImages = @state.images.concat [artwork.denormalized()]
        @setState images: newImages
        $(@refs.autocomplete.getDOMNode()).val('').focus()
        @toggleFillwidth() if @state.images.length > 1

  upload: (e) ->
    gemup e.target.files[0],
      app: sd.GEMINI_APP
      key: sd.GEMINI_KEY
      progress: (percent) =>
        @setState progress: percent
      add: (src) =>
        @setState progress: 0.1
      done: (src) =>
        image = new Image()
        image.src = src
        image.onload = =>
          newImages = @state.images.concat [ { url: src, type: 'image' } ]
          @setState progress: null, images: newImages

  changeLayout: (layout) -> =>
    @setState layout: layout
    @props.section.set layout: layout

  removeItem: (item) -> =>
    newImages = _.without @state.images, item
    @setState images: newImages
    @toggleFillwidth() if @state.images.length > 1

  addArtworkFromUrl: (e) ->
    e.preventDefault()
    val = @refs.byUrl.getDOMNode().value
    slug = _.last(val.split '/')
    @refs.byUrl.setState loading: true
    new Artwork(id: slug).fetch
      error: (m, res) =>
        @refs.byUrl.setState(
          errorMessage: 'Artwork not found. Make sure your urls are correct.'
          loadingUrls: false
        ) if res.status is 404
      success: (artwork) =>
        @refs.byUrl.setState loading: false, errorMessage: ''
        $(@refs.byUrl.getDOMNode()).val ''
        newImages = @state.images.concat [artwork.denormalized()]
        @setState images: newImages
        @toggleFillwidth() if @state.images.length > 1

  toggleFillwidth: ->
    return unless @props.section.get('images').length
    if @props.section.get('layout') is 'overflow_fillwidth'
      @removeFillwidth() if @prevLength isnt @props.section.get('images').length
      @fillwidth()
    else if @props.section.previous('layout') isnt @props.section.get('layout')
      @removeFillwidth()
    @prevLength = @props.section.get('images').length

  fillwidth: ->
    if $(@refs.images.getDOMNode()).find('img').length > 1
      $(@refs.images.getDOMNode()).fillwidthLite
        gutterSize: 30
        apply: (img, i) ->
          img.$el.closest('li').width(img.width)

  removeFillwidth: ->
    $(@refs.images.getDOMNode()).find('li').css(width: '', padding: '')

  render: ->
    section {
      className: 'edit-section-image-collection edit-section-image-container'
      onClick: @props.setEditing(true)
    },
      header { className: 'edit-section-controls' },
        nav { className: 'esic-nav es-layout' },
          a {
            style: {
              backgroundImage: 'url(/icons/edit_artworks_overflow_fillwidth.svg)'
              backgroundSize: '38px'
            }
            className: 'esic-overflow-fillwidth'
            onClick: @changeLayout('overflow_fillwidth')
          }
          a {
            style: {
              backgroundImage: 'url(/icons/edit_artworks_column_width.svg)'
              backgroundSize: '22px'
            }
            className: 'esic-column-width'
            onClick: @changeLayout('column_width')
          }
        section { className: 'dashed-file-upload-container' },
          h1 {}, 'Drag & ',
            span { className: 'dashed-file-upload-container-drop' }, 'drop'
            ' or '
            span { className: 'dashed-file-upload-container-click' }, 'click'
            span {}, ' to upload'
          h2 {}, 'Up to 30mb'
          input { type: 'file', onChange: @upload }
        section { className: 'esic-artwork-inputs' },
          div { className: 'esis-autocomplete-input' },
            input {
              ref: 'autocomplete'
              className: 'bordered-input bordered-input-dark'
              placeholder: 'Search for artwork by title'
            }
          div { className: 'esic-byurl-input' },
            input {
              ref: 'byUrl'
              className: 'bordered-input bordered-input-dark'
              placeholder: 'Add artwork url'
            }
              button {
                className: 'esic-byurl-button avant-garde-button'
                onClick: @addArtworkFromUrl
              }, 'Add'
      (
        if @state.progress
          div { className: 'upload-progress-container' },
            div {
              className: 'upload-progress'
              style: width: (@state.progress * 100) + '%'
            }
      )
      (
        if @state.images.length > 0
          ul { className: 'esic-images-list', ref: 'images' },
            (@state.images.map (item, i) =>
              li { key: i },
                if item.type is 'artwork'
                  [
                    div { className: 'esic-img-container' },
                      img {
                        src: item.image
                        className: 'esic-artwork'
                      }
                    p {},
                      strong {}, item.artist.name if item.artist.name
                    p {},
                      span { className: 'title' }, item.title if item.title
                      if item.date
                        span { className: 'date' }, ", " + item.date if item.date
                    p {}, item.partner.name if item.partner.name
                    button {
                      className: 'edit-section-remove button-reset esic-img-remove'
                      dangerouslySetInnerHTML: __html: $(icons()).filter('.remove').html()
                      onClick: @removeItem(item)
                    }
                  ]
                else
                  [
                    div { className: 'esic-img-container'},
                      img {
                        className: 'esic-image'
                        src: if @state.progress then item.url else resize(item.url, width: 900)
                        style: opacity: if @state.progress then @state.progress else '1'
                      }
                    Input {
                      caption: item.caption
                      images: @state.images
                      url: item.url
                      editing: @props.editing
                    }
                    button {
                      className: 'edit-section-remove button-reset esic-img-remove'
                      dangerouslySetInnerHTML: __html: $(icons()).filter('.remove').html()
                      onClick: @removeItem(item)
                      key: 2
                    }
                    div {
                      dangerouslySetInnerHTML: __html: item.caption
                      className: 'esic-caption esic-caption--display'
                    }
                  ]
            )
        else
          div { className: 'esic-placeholder' }, 'Add images and artworks above'
      )
