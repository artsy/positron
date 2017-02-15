React = require 'react'
Artwork = require '../../../../models/artwork.coffee'
{ div, input, button } = React.DOM

module.exports = React.createClass
  displayName: 'UrlArtworkInput'

  getInitialState: ->
    isLoading: false

  addArtworkFromUrl: (e) ->
    e.preventDefault()
    val = @refs.byUrl.value
    slug = _.last(val.split '/')
    @setState isLoading: !@state.isLoading
    @refs.byUrl.value = ''
    new Artwork(id: slug).fetch
      error: (m, res) =>
        if res.status is 404
          @refs.byUrl.placeholder = 'Artwork not found'
          setTimeout( =>
            @setState isLoading: !@state.isLoading
            @refs.byUrl.placeholder = 'Add artwork url'
          , 3000)
      success: (artwork) =>
        newImages = @props.images.concat [artwork.denormalized()]
        @props.addArtworkFromUrl(newImages)
        @setState isLoading: !@state.isLoading

  render: ->
    isLoading = ''
    if @state.isLoading
      isLoading = ' is-loading'

    div { className: 'esis-byurl-input' },
      input {
        ref: 'byUrl'
        className: 'bordered-input bordered-input-dark'
        placeholder: 'Add artwork url'
      }
      button {
        className: 'esis-byurl-button avant-garde-button' + isLoading
        onClick: @addArtworkFromUrl
      }, 'Add'
