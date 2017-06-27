#
# Image Collection section allows uploading a mix of images and artworks
#
_ = require 'underscore'
React = require 'react'
imagesLoaded = require 'imagesloaded'
Artwork = React.createFactory require './components/artwork.coffee'
Image = React.createFactory require './components/image.coffee'
Controls = React.createFactory require './components/controls.coffee'
DragContainer = React.createFactory require '../../../../../../components/drag_drop/index.coffee'
{ fillWidth }  = require '../../../../../../components/fill_width/index.coffee'
{ div, section, ul, li } = React.DOM

components = require('@artsy/reaction-force/dist/components/publishing/index').default
ImagesetPreview = React.createFactory components.ImagesetPreview

module.exports = React.createClass
  displayName: 'SectionImageCollection'

  getInitialState: ->
    progress: null
    imagesLoaded: false
    dimensions: []

  componentDidMount: ->
    @$list = $(@refs.images)
    @onChange()

  onChange: ->
    sizes = @getFillWidthSizes()
    imagesLoaded $(@refs.images), @onImagesLoaded(sizes)

  onImagesLoaded: (sizes) ->
    @setState
      progress: null
      imagesLoaded: true
      dimensions: fillWidth(
        @props.section.get('images'),
        sizes.targetHeight,
        sizes.containerSize,
        @props.section.get('layout') || @props.section.get('type')
      )

  getFillWidthSizes: ->
    containerSize = 860
    targetHeight = 450
    if @props.section.get('type') is 'image_set' and @props.section.get('images').length > 3
      targetHeight = 300
    else if @props.section.get('layout') is 'column_width'
      containerSize = 580
      targetHeight = 550
    return {containerSize: containerSize, targetHeight: targetHeight}

  setProgress: (progress) ->
    if progress
      @setState
        progress: progress
        imagesLoaded: false
    else
      @onChange()

  removeItem: (item) -> =>
    @setState imagesLoaded: false
    newImages = _.without @props.section.get('images'), item
    @props.section.set images: newImages
    @onChange()

  onDragEnd: (images) ->
    @setState imagesLoaded: false
    @props.section.set images: images
    @onChange()

  largeImagesetClass: ->
    imagesetClass = ''
    if @props.section.get('type') is 'image_set'
      if @props.section.get('images').length > 3
        imagesetClass = ' imageset-block'
      if @props.section.get('images').length > 6
        imagesetClass = ' imageset-block imageset-block--long'
    imagesetClass

  render: ->
    images = @props.section.get 'images' or []
    hasImages = images.length > 0
    isSingle = if images.length is 1 then ' single' else ''
    listClass = if hasImages then '' else ' esic-images-list--placeholder'

    section {
      className: 'edit-section-image-collection edit-section-image-container' + @largeImagesetClass()
      onClick: @props.setEditing(true)
    },
      Controls {
        section: @props.section
        images: images
        setProgress: @setProgress
        onChange: @onChange
        channel: @props.channel
        editing: @props.editing
      }
      if @state.progress
        div { className: 'upload-progress-container' },
          div {
            className: 'upload-progress'
            style: width: (@state.progress * 100) + '%'
          }
      div {
        className: 'esic-images-list' + listClass + isSingle
        ref: 'images'
        style:
          opacity: if @state.imagesLoaded then 1 else 0
      },
        if hasImages
          if !@props.editing and @props.section.get('type') is 'image_set'
            ImagesetPreview {
              images: images
            }
          else
            DragContainer {
              items: images
              onDragEnd: @onDragEnd
              isDraggable: @props.editing
              dimensions: @state.dimensions
            },
              images.map (item, i) =>
                if item.type is 'artwork'
                  Artwork {
                    key: i
                    index: i
                    artwork: item
                    removeItem: @removeItem
                    editing:  @props.editing
                    imagesLoaded: @state.imagesLoaded
                  }
                else
                  Image {
                    index: i
                    key: i
                    image: item
                    removeItem: @removeItem
                    editing:  @props.editing
                    dimensions: @state.dimensions
                    imagesLoaded: @state.imagesLoaded
                  }
        else
          div { className: 'esic-placeholder' }, 'Add images and artworks above'
