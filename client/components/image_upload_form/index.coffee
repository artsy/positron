_ = require 'underscore'
Backbone = require 'backbone'
gemup = require 'gemup'
sd = require('sharify').data
formTemplate = -> require('./form.jade') arguments...

module.exports = class ImageUploadForm extends Backbone.View

  initialize: ({ @upload, @done, @src, @name }) ->
    @render()

  render: ->
    @$el.html formTemplate src: @src, name: @name

  events:
    'change .image-upload-form-input': 'upload'
    'click .image-upload-form-remove': 'remove'

  upload: (e) ->
    gemup e.target.files[0],
      key: sd.GEMINI_KEY
      progress: (percent) =>
        @$('.image-upload-form').attr 'data-state', 'uploading'
        @$('.image-upload-form-progress').css width: "#{percent * 100}%"
      add: (src) =>
        @$el.attr 'data-state', 'uploading'
        @$('.image-upload-form-preview').css 'background-image': src
      done: (src) =>
        img = new Image()
        img.src = src
        img.onload = =>
          @$('.image-upload-form').attr 'data-state', 'loaded'
          @$('.image-upload-form-preview').css 'background-image': "url(#{src})"
        @$('.image-upload-hidden-input').val src
        @done?()

  remove: (e) ->
    e.preventDefault()
    @$('.image-upload-form').attr 'data-state', ''
    @$('.image-upload-form-preview').css 'background-image': ''
    @remove?()