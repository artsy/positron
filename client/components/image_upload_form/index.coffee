_ = require 'underscore'
Backbone = require 'backbone'
gemup = require 'gemup'
sd = require('sharify').data
formTemplate = -> require('./form.jade') arguments...

module.exports = class ImageUploadForm extends Backbone.View

  initialize: ({ @upload, @done, @src }) ->
    @render()

  render: ->
    @$el.html formTemplate src: @src

  events:
    'change #edit-thumbnail-image': 'uploadThumbnail'
    'click #edit-thumbnail-remove': 'removeThumbnail'

  upload: (e) ->
    gemup e.target.files[0],
      key: sd.GEMINI_KEY
      progress: (percent) => console.log arguments
      add: (src) => console.log arguments
      done: (src) => console.log arguments

  remove: (e) ->
    e.preventDefault()