React = require 'react'
icons = -> require('../../../../icons.jade') arguments...
RichTextCaption = React.createFactory require '../../../../../../../components/rich_text_caption/index.coffee'
{ resize } = require '../../../../../../../components/resizer/index.coffee'
{ div, img, button } = React.DOM

module.exports = React.createClass
  displayName: 'ImageCollectionDisplayImage'

  setHeight: ->
    if @props.dimensions?[@props.index]
      return @props.dimensions[@props.index].height
    else
      return 'auto'

  render: ->
    image = @props.image
    url = resize image.url, width: 900

    div { className: 'esic-img-container' },
      img {
        className: 'esic-image'
        src: if @props.progress then image.url else url
        height: @setHeight()
        style: opacity: if !@props.imagesLoaded then 0 else 1
      }
      unless @props.progress
        RichTextCaption {
          item: image
          editing: @props.editing
          placeholder: 'Image Caption'
        }
      if @props.removeItem and @props.editing
        button {
          className: 'edit-section-remove button-reset esic-img-remove'
          onClick: @props.removeItem(image)
          dangerouslySetInnerHTML: __html: $(icons()).filter('.remove').html()
        }