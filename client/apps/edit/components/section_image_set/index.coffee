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
UrlArtworkInput = React.createFactory require './url_artwork_input.coffee'
DraftInputCaption = React.createFactory require '../../../../components/draft_input/draft_input_caption.coffee'
{ div, section, h1, h2, span, img, header, input, a, button, p, ul, li, strong } = React.DOM
{ resize } = require '../../../../components/resizer/index.coffee'

module.exports = React.createClass
  displayName: 'SectionImageSet'

  getInitialState: ->
    images: @props.section.get('images') or []
    progress: null

  componentDidMount: ->
    @setupAutocomplete()
    @showPreviewImages()

  componentDidUpdate: ->
    @showPreviewImages()

  componentWillUnmount: ->
    @autocomplete.remove()

  componentWillUpdate: ->
    @props.section.set images: @state.images if @state.images.length > 0

  setupAutocomplete: ->
    $el = $(@refs.autocomplete)
    @autocomplete = new Autocomplete
      url: "#{sd.ARTSY_URL}/api/search?q=%QUERY"
      el: $el
      filter: (res) ->
        vals = []
        for r in res._embedded.results
          if r.type?.toLowerCase() == 'artwork'
            id = r._links.self.href.substr(r._links.self.href.lastIndexOf('/') + 1)
            vals.push
              id: id
              value: r.title
              thumbnail: r._links.thumbnail.href
        return vals
      templates:
        suggestion: (data) ->
          """
            <div class='esis-suggestion' \
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
        $(@refs.autocomplete).val('').focus()

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
          newImages = @state.images.concat [{
            url: src
            type: 'image'
            width: image.width
            height: image.height
          }]
          @setState progress: null, images: newImages

  removeItem: (item) -> =>
    newImages = _.without @state.images, item
    @setState images: newImages

  addArtworkFromUrl: (newImages) ->
    @setState images: newImages

  showPreviewImages: ->
    # Slideshow Preview
    $('.esis-preview-image-container').each (i, value) ->
      allowedPixels = 560.0 - 100 # min-width + margins
      totalPixels = 0.0
      $(value).find('img').each (i, img) ->
        _.defer -> _.defer ->
          totalPixels = totalPixels + img.width
          if totalPixels > allowedPixels
            $(img).css('display', 'none')
          else
            $(img).css('display', 'inline-block')

  formatArtistNames: (artwork) ->
    if artwork.artists?[0]
      names = artwork.artists.map (artist) ->
        artist.name
      names.join ', '
    else
      artwork.artist?.name

  render: ->
    section {
      className: 'edit-section-image-set'
      onClick: @props.setEditing(true)
    },
      header { className: 'edit-section-controls' },
        section { className: 'dashed-file-upload-container' },
          h1 {}, 'Drag & ',
            span { className: 'dashed-file-upload-container-drop' }, 'drop'
            ' or '
            span { className: 'dashed-file-upload-container-click' }, 'click'
            span {}, ' to upload'
          h2 {}, 'Up to 30mb'
          input { type: 'file', onChange: @upload }
        section { className: 'esis-artwork-inputs' },
          div { className: 'esis-autocomplete-input' },
            input {
              ref: 'autocomplete'
              className: 'bordered-input bordered-input-dark'
              placeholder: 'Search for artwork by title'
            }
          UrlArtworkInput {
            images: @state.images
            addArtworkFromUrl: @addArtworkFromUrl
          }
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
          ul { className: 'esis-images-list', ref: 'images' },
            (@state.images.map (item, i) =>
              li { key: i },
                if item.type is 'artwork'
                  [
                    div { className: 'esis-img-container', key: 'artwork-' + i},
                      img {
                        src: item.image
                        className: 'esis-artwork'
                      }
                    div {className: 'esis-caption', key: 'caption-' + i },
                      p {},
                        strong {}, @formatArtistNames item
                      p {}, item.title if item.title
                      p {}, item.partner.name if item.partner.name
                    button {
                      className: 'edit-section-remove button-reset esis-img-remove'
                      dangerouslySetInnerHTML: __html: $(icons()).filter('.remove').html()
                      onClick: @removeItem(item)
                      key: 'remove-' + i
                    }
                  ]
                else
                  [
                    div { className: 'esis-img-container', key: 'image-' + i},
                      [
                        img {
                          className: 'esis-image'
                          src: if @state.progress then item.url else resize(item.url, width: 900)
                          style: opacity: if @state.progress then @state.progress else '1'
                        }
                        DraftInputCaption {
                          item: item
                          key: 'caption-edit-' + i
                        }
                      ]
                    button {
                      className: 'edit-section-remove button-reset esis-img-remove'
                      dangerouslySetInnerHTML: __html: $(icons()).filter('.remove').html()
                      onClick: @removeItem(item)
                      key: 'remove-' + i
                    }
                  ]
            )
        else
          div { className: 'esis-placeholder' }, 'Add images and artworks above'
      )
      (
        if @state.images.length > 0
          div { className: 'esis-preview-container' },
            div { className: 'esis-preview-image-container' },
              @state.images.slice(0,4).map (item, i) =>
                img {
                  key: 'image-' + i
                  src: resize((item.image or item.url or ''), height: 150)
                  className: 'esis-preview-image'
                }
            div {
              className: 'esis-preview-remaining'
              ref: 'remaining'
            },
              div {
                className: 'esis-preview-icon' + (if @state.images.length > 9 then ' is-double-digit' else '')
                dangerouslySetInnerHTML: __html: $(icons()).filter('.image-set').html()
                "data-total": "#{@state.images.length}"
              }
              div { className: 'esis-preview-text' }, "Enter Slideshow"
      )
