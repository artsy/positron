_ = require 'underscore'

exports.fillWidth = (images, targetHeight, containerWidth, layout, margin=30) ->

  setDimensions = (images, targetHeight, containerWidth, layout) ->
    aspectRatios = getAspectRatios(images)
    dimensions = images.map (image, i) =>
      if layout is 'column_width'
        return {
          id: i
          width: containerWidth
          height: containerWidth / aspectRatios[i]
        }
      else
        return {
          id: i
          width: targetHeight * aspectRatios[i]
          height: targetHeight
        }
    dimensions

  getAspectRatios = (images) ->
    ratios = images.map (image, i) ->
      return image.width / image.height
    ratios

  containerWithMargin = (images, containerWidth, margin=30) ->
    margins = margin * (images.length - 1)
    containerWidth - margins

  widthDiff = (dimensions, images, containerWidth, margin) ->
    currentWidth = _.reduce dimensions, (sum, img) =>
      return sum + img.width
    , 0
    return containerWithMargin(images, containerWidth, margin) - currentWidth

  resizeHeight = (images, dir) ->
    resized = images.map (img, i) =>
      img.width += (img.width / img.height) * dir
      img.height += dir
      return img
    resized

  dimensions = setDimensions(images, targetHeight, containerWidth, layout)
  unless layout is 'column_width' or (layout is 'image_set' and images.length > 3)
    loop
      direction = if widthDiff(dimensions, images, containerWidth, margin) < 0 then -1 else 1
      dimensions = resizeHeight dimensions, direction
      break if direction is 1
  dimensions
