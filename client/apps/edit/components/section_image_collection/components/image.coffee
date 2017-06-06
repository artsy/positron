React = require 'react'
icons = -> require('../icons.jade') arguments...
RichTextCaption = React.createFactory require '../../../../../components/rich_text_caption/index.coffee'
{ resize } = require '../../../../../components/resizer/index.coffee'
{ div, img, button } = React.DOM

module.exports = React.createClass
  displayName: 'ImageCollectionDisplayImage'

  render: ->
    image = @props.image

    div { className: 'esic-img-container' },
      img {
        className: 'esic-image'
        src: if @props.progress then image.url else resize image.url, width: 900
        style: opacity: if @props.progress then @props.progress else '1'
      }
      if @props.editing
        RichTextCaption {
          item: image
        }
      else
        div {
          dangerouslySetInnerHTML: __html: image.caption
          className: 'esic-caption esic-caption--display'
        }
      button {
        className: 'edit-section-remove button-reset esic-img-remove'
        onClick: @props.removeItem(image)
        dangerouslySetInnerHTML: __html: $(icons()).filter('.remove').html()
      }