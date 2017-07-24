# Use this input to find an artwork by its artsy.net url
# Pass in the parents images and an update function

# Example:
# UrlArtworkInput { images: @state.images, addArtworkFromUrl: @addArtworkFromUrl}

React = require 'react'
Artwork = require '../../../../../../../models/artwork.coffee'
_ = require 'underscore'
{ div, input, button } = React.DOM

module.exports = React.createClass
  displayName: 'UrlArtworkInput'

  getInitialState: ->
    url: ''
    isLoading: false
    error: false

  addArtworkFromUrl: (e) ->
    e.preventDefault()
    slug = _.last(@state.url.split '/')
    @setState isLoading: !@state.isLoading, url: ''
    new Artwork(id: slug).fetch
      error: (m, res) =>
        if res.status is 404
          @setState error: !@state.error
          setTimeout( =>
            @setState
              isLoading: !@state.isLoading
              error: !@state.error
          , 3000)
      success: (artwork) =>
        newImages = @props.images.concat [artwork.denormalized()]
        @props.addArtworkFromUrl(newImages)
        @setState isLoading: !@state.isLoading

  onChange: (e) ->
    @setState url: e.target.value

  render: ->
    isLoading = if @state.isLoading then ' is-loading' else ''
    error = if @state.error then 'Artwork not found' else ''

    div { className: 'esis-byurl-input' },
      input {
        className: 'bordered-input bordered-input-dark'
        placeholder: 'Add artwork url'
        value: @state.url
        onChange: @onChange
      }
      button {
        className: 'esis-byurl-button avant-garde-button' + isLoading
        onClick: @addArtworkFromUrl
      }, 'Add'
      div { className: 'esis-urls-error'}, error