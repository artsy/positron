React = require 'react'
_ = require 'underscore'
sd = require('sharify').data
gemup = require 'gemup'
SectionControls = React.createFactory require '../../../section_controls/index.coffee'
UrlArtworkInput = React.createFactory require './url_artwork_input.coffee'
Autocomplete = require '../../../../../../../components/autocomplete/index.coffee'
Artwork = require '../../../../../../../models/artwork.coffee'
FileInput = require '../../../../../../../components/file_input/index.jsx'
{ div, section, h1, h2, span, header, input, a, nav } = React.DOM

module.exports = React.createClass
  displayName: 'ImageCollectionControls'

  componentDidMount: ->
    @setupAutocomplete()

  componentWillUnmount: ->
    @autocomplete.remove()

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
            <div class='autocomplete-suggestion' \
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

  onUpload: (image, width, height) ->
    newImages = @props.images.concat [{
      url: image
      type: 'image'
      width: width
      height: height
      caption: ''
    }]
    @props.section.set images: newImages

  render: ->
    SectionControls {
      section: @props.section
      channel: @props.channel
      articleLayout: @props.article.get('layout')
      onChange: @props.onChange
      sectionLayouts: true
    },
      React.createElement(
        FileInput.default,
        { onUpload: @onUpload, onProgress: @props.setProgress }
      )
      section { className: 'edit-controls__artwork-inputs' },
        div { className: 'edit-controls__autocomplete-input' },
          input {
            ref: 'autocomplete'
            className: 'bordered-input bordered-input-dark'
            placeholder: 'Search for artwork by title'
          }
        UrlArtworkInput {
          images: @props.images
          addArtworkFromUrl: @addArtworkFromUrl
        }
