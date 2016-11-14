_ = require 'underscore'
Backbone = require 'backbone'
gemup = require 'gemup'
sd = require('sharify').data
formTemplate = -> require('./form.jade') arguments...

module.exports = class ImageVideoUploadForm extends Backbone.View

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
    type = e.target.files[0]?.type
    acceptedTypes = ['image/jpg','image/jpeg','image/gif','image/png','video/mp4']
    if type not in acceptedTypes
      @$('.image-upload-form').attr 'data-error', 'type'
      return
    if e.target.files[0]?.size > 10000000
      @$('.image-upload-form').attr 'data-error', 'size'
      return
    @$('.image-upload-form').attr 'data-error', null
    gemup e.target.files[0],
      app: sd.GEMINI_APP
      key: sd.GEMINI_KEY
      progress: (percent) =>
        @$('.image-upload-form').attr 'data-state', 'uploading'
        @$('.image-upload-form-preview source').attr('src', '')
        @$('.image-upload-form-progress').css width: "#{percent * 100}%"
      add: (src) =>
        @$el.attr 'data-state', 'uploading'
      done: (src) =>
        if src.indexOf('mp4') > 0
          @$('div.image-upload-form-preview').replaceWith("<video class='image-upload-form-preview'><source></source></video>")
          @$('.image-upload-form-preview source').attr('src', src)
        else
          @$('video.image-upload-form-preview').replaceWith("<div class='image-upload-form-preview'></div>")
          img = new Image
          img.src = src
          img.onload = =>
            @$('.image-upload-form-preview').css 'background-image': "url(#{src})"
        @$('.image-upload-form').attr 'data-state', 'loaded'
        @$('.image-upload-hidden-input').val src
        @options.done? src

  onRemove: (e) ->
    e.preventDefault()
    return unless confirm 'Are you sure you want to remove this file?'
    @$('.image-upload-form').attr 'data-state', ''
    @$('.image-upload-form-preview').replaceWith("<div class='image-upload-form-preview'></div>")
    @$('.image-upload-hidden-input').val ''
    @options.remove?()

  toggleDragover: ->
    @$('.image-upload-form').toggleClass 'is-dragover'
