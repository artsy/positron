_ = require 'underscore'
Backbone = require 'backbone'
gemup = require 'gemup'
sd = require('sharify').data
formTemplate = -> require('./form.jade') arguments...

module.exports = class ImageUploadForm extends Backbone.View

  initialize: (@options) ->
    @render()

  render: ->
    @$el.html formTemplate src: @options.src, name: @options.name

  events:
    'change .image-upload-form-input': 'upload'
    'click .image-upload-form-remove': 'onRemove'
    'dragenter': 'toggleDragover'
    'dragleave': 'toggleDragover'

  upload: (e) ->
    @$('.image-upload-form').removeClass 'is-dragover'
    gemup e.target.files[0],
      key: sd.GEMINI_KEY
      progress: (percent) =>
        @$('.image-upload-form').attr 'data-state', 'uploading'
        @$('.image-upload-form-progress').css width: "#{percent * 100}%"
      add: (src) =>
        @$el.attr 'data-state', 'uploading'
        @$('.image-upload-form-preview').css 'background-image': src
      done: (src) =>
        img = new Image
        img.src = src
        img.onload = =>
          @$('.image-upload-form').attr 'data-state', 'loaded'
          @$('.image-upload-form-preview').css 'background-image': "url(#{src})"
        @$('.image-upload-hidden-input').val src
        @options.done? src

  onRemove: (e) ->
    e.preventDefault()
    return unless confirm 'Are you sure you want to remove this image?'
    @$('.image-upload-form').attr 'data-state', ''
    @$('.image-upload-form-preview').css 'background-image': ''
    @$('.image-upload-hidden-input').val ''
    @options.remove?()

  toggleDragover: ->
    @$('.image-upload-form').toggleClass 'is-dragover'
