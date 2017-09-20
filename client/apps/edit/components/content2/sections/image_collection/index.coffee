#
# Image Collection section allows uploading a mix of images and artworks
#
_ = require 'underscore'
React = require 'react'
components = require('@artsy/reaction-force/dist/components/publishing/index').default
FillWidth = require('@artsy/reaction-force/dist/utils/fillwidth').default
imagesLoaded = require 'imagesloaded'

Artwork = require './components/artwork.jsx'
Controls = require './components/controls.jsx'
DragContainer = React.createFactory require '../../../../../../components/drag_drop/index.coffee'
Image = require './components/image.jsx'
ImageSetPreview = React.createFactory components.ImageSetPreview
ImageSetPreviewClassic = React.createFactory components.ImageSetPreviewClassic
{ div, section, ul, li } = React.DOM

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
      dimensions: FillWidth(
        @props.section.get('images'),
        sizes.containerSize,
        30,
        sizes.targetHeight
      )

  getFillWidthSizes: ->
    articleLayout = @props.article.get('layout')
    sectionLayout = @props.section.get('layout')
    if articleLayout is 'classic'
      containerSize = if sectionLayout is 'column_width' then 580 else 900
    else if articleLayout in ['standard', 'feature']
      containerSize = if sectionLayout is 'column_width' then 680 else 780
    targetHeight = window.innerHeight * .7
    if @props.section.get('type') is 'image_set' and @props.section.get('images').length > 3
      targetHeight = 400
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

  isImageSetWrapping: ->
    return true if @props.section.get('type') is 'image_set' &&
     @props.section.get('images').length > 3

  getImageWidth: (i) ->
    unless @state.dimensions[i]?.width
      return 'auto'
    if this.isImageSetWrapping()
      return @state.dimensions[i]?.width * 2
    else
      return @state.dimensions[i]?.width

  renderImages: (images) ->
    images.map (item, i) =>
      width = this.getImageWidth()

      if item.type is 'artwork'
        React.createElement(
          Artwork.default, {
            key: i
            index: i
            artwork: item
            removeItem: @removeItem
            editing:  @props.editing
            imagesLoaded: @state.imagesLoaded
            article: @props.article
            section: @props.section
            width: @getImageWidth(i)
          }
        )
      else
        React.createElement(
          Image.default, {
            index: i
            key: i
            image: item
            removeItem: @removeItem
            editing:  @props.editing
            imagesLoaded: @state.imagesLoaded
            article: @props.article
            section: @props.section
            onChange: @onChange
            width: @getImageWidth(i)
          }
        )

  render: ->
    images = @props.section.get 'images' or []
    hasImages = images.length > 0
    isSingle = if images.length is 1 then ' single' else ''
    listClass = if hasImages then '' else ' image-collection__list--placeholder'

    section {
      className: 'edit-section--image-collection'
      onClick: @props.setEditing(true)
      'data-overflow': @isImageSetWrapping()
    },
      if @props.editing
        React.createElement(
          Controls.default, {
            section: @props.section
            images: images
            setProgress: @setProgress
            onChange: @onChange
            channel: @props.channel
            editing: @props.editing
            article: @props.article
          }
        )
      if @state.progress
        div { className: 'upload-progress-container' },
          div {
            className: 'upload-progress'
            style: width: (@state.progress * 100) + '%'
          }
      div {
        className: 'image-collection__list' + listClass + isSingle
        ref: 'images'
        style:
          opacity: if @state.imagesLoaded then 1 else 0
      },
        if hasImages
          if !@props.editing and @props.section.get('type') is 'image_set'
            if @props.article.get('layout') is 'classic'
              ImageSetPreviewClassic {
                images: images
              }
            else
              ImageSetPreview {
                section:
                  images: images
                  layout: @props.section.get('layout')
                  title: @props.section.get('title')
              }
          else if images.length > 1
            DragContainer {
              items: images
              onDragEnd: @onDragEnd
              isDraggable: @props.editing
              dimensions: @state.dimensions
              isWrapping: @isImageSetWrapping
            },
              @renderImages(images)
          else
            @renderImages(images)

        else
          div { className: 'edit-section__placeholder' }, 'Add images and artworks above'
