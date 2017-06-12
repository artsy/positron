#
# Image Collection section allows uploading a mix of images and artworks
#

_ = require 'underscore'
React = require 'react'
imagesLoaded = require 'imagesloaded'
DisplayArtwork = React.createFactory require './components/artwork.coffee'
DisplayImage = React.createFactory require './components/image.coffee'
Controls = React.createFactory require './components/controls.coffee'
DragContainer = React.createFactory require '../../../../components/drag_drop/index.coffee'
{ div, section, ul, li } = React.DOM

module.exports = React.createClass
  displayName: 'SectionImageCollection'

  getInitialState: ->
    progress: null
    imagesLoaded: false

  componentDidMount: ->
    @$list = $(@refs.images).find('.drag-container')
    imagesLoaded @$list, =>
      @onChange()

  onChange: ->
    @forceUpdate() if @$list.children().length isnt @props.section.get('images').length
    unless @props.section.get('layout') is 'column_width'
      @setState imagesLoaded: false
      @fillwidth()
    else
      @removeFillwidth()
      @setState imagesLoaded: true

  setProgress: (progress) ->
    if progress
      @setState
        progress: progress
        imagesLoaded: false
    else
      imagesLoaded @$list, =>
        @onChange()
        @setState
          progress: progress

  removeItem: (item) -> =>
    @setState imagesLoaded: false
    newImages = _.without @props.section.get('images'), item
    @props.section.set images: newImages
    imagesLoaded @$list, =>
      @onChange()

  fillwidth: ->
    @removeFillwidth()
    @$list.fillwidthLite
      gutterSize: 30
      apply: (img, i) ->
        img.$el.closest('.esic-img-container').width(img.width)
      done: (imgs) =>
        @setState
          progress: null
          imagesLoaded: true

  removeFillwidth: ->
    @setState imagesLoaded: false
    @$list.find('.esic-img-container').css(width: '', padding: '')

  onDragEnd: (images) ->
    @setState imagesLoaded: false
    @props.section.set 'images', images
    imagesLoaded @$list, =>
      @onChange()

  render: ->
    hasImages = @props.section.get('images').length > 0
    listClass = if hasImages then '' else ' esic-images-list--placeholder'

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
      div {
        className: 'esic-images-list' + listClass
        ref: 'images'
        style:
          opacity: if @state.imagesLoaded then 1 else 0
      },
        DragContainer {
          items: @props.section.get('images')
          onDragEnd: @onDragEnd
          isDraggable: @props.editing
        },
          if hasImages
            @props.section.get('images').map (item, i) =>
              if item.type is 'artwork'
                DisplayArtwork {
                  key: i
                  index: i
                  artwork: item
                  removeItem: @removeItem
                }
              else
                DisplayImage {
                  index: i
                  key: i
                  image: item
                  removeItem: @removeItem
                  progress: @state.progress
                  editing:  @props.editing
                }
          else
            div { className: 'esic-placeholder' }, 'Add images and artworks above'
