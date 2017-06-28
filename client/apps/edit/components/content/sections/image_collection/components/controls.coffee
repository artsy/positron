React = require 'react'
_ = require 'underscore'
sd = require('sharify').data
gemup = require 'gemup'
SectionControls = React.createFactory require '../../../section_controls/index.coffee'
UrlArtworkInput = React.createFactory require './url_artwork_input.coffee'
Autocomplete = require '../../../../../../../components/autocomplete/index.coffee'
Artwork = require '../../../../../../../models/artwork.coffee'
{ div, section, h1, h2, span, header, input, a, nav } = React.DOM

module.exports = React.createClass
  displayName: 'ImageCollectionControls'

  componentDidMount: ->
    @setupAutocomplete()

  componentWillUnmount: ->
    @autocomplete.remove()

  changeLayout: (e) ->
    if @props.section.get('type') is 'image_set'
      @props.section.set 'type', 'image_collection'
    e = if e.target then e.target.name else e
    @props.section.set layout: e
    @props.onChange()

  toggleImageSet: ->
    if @props.section.get('type') is 'image_collection'
      @props.section.unset 'layout'
      @props.section.set 'type', 'image_set'
    else
      @props.section.set
        layout: 'overflow_fillwidth'
        type: 'image_collection'
    @props.onChange()

  addArtworkFromUrl: (newImages) ->
    @props.section.set images: newImages
    @props.onChange()

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
              thumbnail: r._links.thumbnail?.href
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
        newImages = @props.images.concat [artwork.denormalized()]
        @props.section.set images: newImages
        $(@refs.autocomplete).val('').focus()
        @props.onChange()

  upload: (e) ->
    gemup e.target.files[0],
      app: sd.GEMINI_APP
      key: sd.GEMINI_KEY
      progress: (percent) =>
        @props.setProgress percent
      add: (src) =>
        @props.setProgress 0.1
      done: (src) =>
        image = new Image
        image.src = src
        image.onload = =>
          newImages = @props.images.concat [{
            url: src
            type: 'image'
            width: image.width
            height: image.height
          }]
          @props.section.set images: newImages
          @props.setProgress null

  render: ->
    SectionControls {
      editing: @props.editing
      section: @props.section
      channel: @props.channel
    },
      nav { className: 'es-layout' },
        a {
          name: 'overflow_fillwidth'
          className: 'layout'
          onClick: @changeLayout
          'data-active': @props.section.get('layout') is 'overflow_fillwidth'
        }
        a {
          name: 'column_width'
          className: 'layout'
          onClick: @changeLayout
          'data-active': @props.section.get('layout') is 'column_width'
        }
        if @props.channel.hasFeature 'image_set'
          a {
            name: 'image_set'
            className: 'layout'
            onClick: @toggleImageSet
            'data-active': @props.section.get('type') is 'image_set'
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
        UrlArtworkInput {
          images: @props.images
          addArtworkFromUrl: @addArtworkFromUrl
        }