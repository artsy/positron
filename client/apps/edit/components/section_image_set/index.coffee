#
# Image Set section that allows uploading a mix of images and artworks
#

# Using `try` here b/c Scribe is an AMD module that doesn't play nice when
# requiring it for testing in node.
try
  Scribe = require 'scribe-editor'
  scribePluginToolbar = require 'scribe-plugin-toolbar'
  scribePluginSanitizer = require '../../lib/sanitizer.coffee'
  scribePluginLinkTooltip = require 'scribe-plugin-enhanced-link-tooltip'
_ = require 'underscore'
gemup = require 'gemup'
React = require 'react'
toggleScribePlaceholder = require '../../lib/toggle_scribe_placeholder.coffee'
sd = require('sharify').data
icons = -> require('./icons.jade') arguments...
Autocomplete = require '../../../../components/autocomplete/index.coffee'
Artwork = require '../../../../models/artwork.coffee'
{ div, section, h1, h2, span, img, header, input, nav, a, button, p, ul, li, strong } = React.DOM
{ crop, resize, fill } = require('embedly-view-helpers')(sd.EMBEDLY_KEY)

module.exports = React.createClass

  getInitialState: ->
    images: @props.section.get('images') or []
    progress: null

  componentDidMount: ->
    @attachScribe()
    @setupAutocomplete()
    @showPreviewImages()

  componentDidUpdate: ->
    @attachScribe()

  componentWillUnmount: ->
    @autocomplete.remove()

  onStateChange: ->
    @props.section.set images: @state.images if @state.images.length > 0
    @showPreviewImages()
    @forceUpdate()

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
        @state.images.push artwork.denormalized()
        $(@refs.autocomplete.getDOMNode()).val('').focus()
        @onStateChange()

  upload: (e) ->
    gemup e.target.files[0],
      key: sd.GEMINI_KEY
      progress: (percent) =>
        @setState progress: percent
      add: (src) =>
        @setState progress: 0.1
      done: (src) =>
        image = new Image()
        image.src = src
        image.onload = =>
          @state.images.push url: src, type: 'image'
          @setState progress: null
          @onStateChange()

  removeItem: (item) -> =>
    @state.images = _.without @state.images, item
    @onStateChange()

  attachScribe: ->
    return if @scribe? or not @props.editing
    return unless @refs.editable
    @scribe = new Scribe @refs.editable.getDOMNode()
    @scribe.use scribePluginSanitizer {
      tags:
        p: true
        i: true
        a: { href: true, target: '_blank' }
    }
    @scribe.use scribePluginToolbar @refs.toolbar.getDOMNode()
    @scribe.use scribePluginLinkTooltip()
    toggleScribePlaceholder @refs.editable.getDOMNode()

  onEditableKeyup: ->
    toggleScribePlaceholder @refs.editable.getDOMNode()
    @setState caption: $(@refs.editable.getDOMNode()).html()

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
        @state.images.push artwork.denormalized()
        @onStateChange()

  showPreviewImages: ->
    allowedPixels = 500 - 40.0
    totalPixels = 0.0
    $('.esis-preview-container .esis-preview-image').each (i, value) ->
      _.defer ->
        totalPixels = totalPixels + ((150.0 * value.width) / value.height)
        if totalPixels > allowedPixels
          return
        else
          $(value).css('display', 'inline-block')

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
          div { className: 'esis-byurl-input' },
            input {
              ref: 'byUrl'
              className: 'bordered-input bordered-input-dark'
              placeholder: 'Add artwork url'
            }
              button {
                className: 'esis-byurl-button avant-garde-button'
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
          ul { className: 'esis-images-list', ref: 'images' },
            (@state.images.map (item, i) =>
              li { key: i },
                if item.type is 'artwork'
                  [
                    div { className: 'esis-img-container' },
                      img {
                        src: item.image
                        className: 'esis-artwork'
                      }
                    p {},
                      strong {}, item.artist.name if item.artist.name
                    p {}, item.title if item.title
                    p {}, item.partner.name if item.partner.name
                    button {
                      className: 'edit-section-remove button-reset esis-img-remove'
                      dangerouslySetInnerHTML: __html: $(icons()).filter('.remove').html()
                      onClick: @removeItem(item)
                    }
                  ]
                else
                  [
                    div { className: 'esis-img-container', key: 0 },
                      img {
                        className: 'esis-image'
                        src: if @state.progress then item.url else resize(item.url, width: 900)
                        style: opacity: if @state.progress then @state.progress else '1'
                      }
                    if item.caption
                      div {
                        className: 'esis-inline-caption'
                        dangerouslySetInnerHTML: __html: item.caption
                        key: 1
                      }
                    else
                      div { className: 'esis-caption-container', key: 1 },
                        div {
                          className: 'esis-caption bordered-input'
                          ref: 'editable'
                          onKeyUp: @onEditableKeyup
                          dangerouslySetInnerHTML: __html: item.caption
                        }
                        nav { ref: 'toolbar', className: 'edit-scribe-nav esis-nav' },
                          button {
                            'data-command-name': 'italic'
                            dangerouslySetInnerHTML: __html: '&nbsp;'
                            disabled: if item.caption then false else true
                          }
                          button {
                            'data-command-name': 'linkPrompt'
                            dangerouslySetInnerHTML:
                              __html: "&nbsp;" + $(icons()).filter('.link').html()
                            disabled: if item.caption then false else true
                          }
                    button {
                      className: 'edit-section-remove button-reset esis-img-remove'
                      dangerouslySetInnerHTML: __html: $(icons()).filter('.remove').html()
                      onClick: @removeItem(item)
                      key: 2
                    }
                  ]
            )
        else
          div { className: 'esis-placeholder' }, 'Add images and artworks above'
      )
      (
        if @state.images.length > 0
          div { className: 'esis-preview-container' },
            @state.images.map (item, i) =>
              img {
                src: item.image or item.url or ''
                className: 'esis-preview-image'
              }
            div { className: 'esis-preview-remaining' },
              div {
                className: 'esis-preview-icon'
                dangerouslySetInnerHTML: __html: $(icons()).filter('.image-set').html()
              }
              "#{@state.images.length} Enter Slideshow"
      )
