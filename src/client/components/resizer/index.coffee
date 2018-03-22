{ NODE_ENV, GEMINI_CLOUDFRONT_URL } = require('sharify').data
qs = require 'qs'
{ compact } = require 'underscore'

warn = (message) ->
  console.warn message if NODE_ENV is 'development'

endpoint = GEMINI_CLOUDFRONT_URL

defaults =
  quality: 95
  color: 'fff'

module.exports = gemini =

  resize: (url, options = {}) =>

    resize_to = if width? and not height?
        'width'
      else if height? and not width?
        'height'
      else
        'fit'

    { width, height, quality } = options

    unless width? or height?
      warn 'requires `width || height`'
      return url

    if width? and width is 0
      warn '`width` must be non-zero'
      return url

    if height? and height is 0
      warn '`height` must be non-zero'
      return url

    resize_to = if width? and not height?
      'width'
    else if height? and not width?
      'height'
    else
      'fit'

    options =
      resize_to: resize_to
      src: url
      width: width if width?
      height: height if height?
      quality: quality or defaults.quality

    [endpoint , qs.stringify options].join '?'

  crop: (url, options = {}) =>
    { width, height, quality } = options

    unless width? and height?
      warn 'requires `width && height`'
      return url

    if width is 0
      warn '`width` must be non-zero'
      return url

    if height is 0
      warn '`height` must be non-zero'
      return url

    options =
      resize_to: 'fill'
      src: url
      width: width
      height: height
      quality: quality or defaults.quality

    [endpoint , qs.stringify options].join '?'

  fill: (url, options = {}) =>
    gemini.crop(url, options)
