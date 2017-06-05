#
# Image Collection section allows uploading a mix of images and artworks
#

_ = require 'underscore'
React = require 'react'
imagesLoaded = require 'imagesloaded'
DisplayArtwork = React.createFactory require './components/artwork.coffee'
DisplayImage = React.createFactory require './components/image.coffee'
Controls = React.createFactory require './components/controls.coffee'
{ div, section, ul, li } = React.DOM

module.exports = React.createClass
  displayName: 'SectionImageCollection'

  getInitialState: ->
    progress: null

  componentDidMount: ->
    @$list = $(@refs.images)
    imagesLoaded @$list, =>
      @onChange()
      @$list.animate({opacity: 1}, 250) if @props.section.get('layout') != 'column_width'

  onChange: ->
    @forceUpdate() if @$list.children().length isnt @props.section.get('images').length
    if @props.section.get('images').length > 1 and @props.section.get('layout') != 'column_width'
      @fillwidth()
    else
      @removeFillwidth()

  setProgress: (progress) ->
    if progress
      @setState progress: progress
    else
      imagesLoaded @$list, =>
        @onChange()
        @setState progress: progress

  removeItem: (item) -> =>
    newImages = _.without @props.section.get('images'), item
    @props.section.set images: newImages
    @onChange()

  fillwidth: ->
    @$list.css('opacity', 0)
    @removeFillwidth()
    @$list.fillwidthLite
      gutterSize: 30
      apply: (img, i) ->
        img.$el.closest('li').width(img.width)
      done: (imgs) =>
        @setState progress: null
        @$list.animate({opacity: 1}, 250)

  removeFillwidth: ->
    @$list.find('li').css(width: '', padding: '')

  render: ->
    section {
      className: 'edit-section-image-collection edit-section-image-container'
      onClick: @props.setEditing(true)
    },
      Controls {
        section: @props.section
        images: @props.section.get('images') || []
        setProgress: @setProgress
        onChange: @onChange
      }
      if @state.progress
        div { className: 'upload-progress-container' },
          div {
            className: 'upload-progress'
            style: width: (@state.progress * 100) + '%'
          }
      (
        if @props.section.get('images').length > 0
          ul { className: 'esic-images-list', ref: 'images' },
            @props.section.get('images').map (item, i) =>
              li {
                key: i
                style:
                  opacity: if @state.progress then 0 else 1
              },
                if item.type is 'artwork'
                  DisplayArtwork {
                    key: 'artwork-' + i
                    index: i
                    artwork: item
                    removeItem: @removeItem
                  }
                else
                  DisplayImage {
                    key: 'image-' + i
                    index: i
                    image: item
                    removeItem: @removeItem
                    progress: @state.progress
                    editing:  @props.editing
                  }
        else
          ul { className: 'esic-images-list--placeholder', ref: 'images' },
            li { className: 'esic-placeholder' }, 'Add images and artworks above'
      )
