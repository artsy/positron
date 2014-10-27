Backbone = require 'backbone'
gemup = require 'gemup'
sd = require('sharify').data
thumbnailFormTemplate = -> require('./form.jade') arguments...

module.exports = class EditThumbnail extends Backbone.View

  initialize: (options) ->
    { @article } = options
    @article.on 'change:thumbnail_image', @renderThumbnailForm

  renderThumbnailForm: =>
    @$('#edit-thumbnail-inputs-left').html thumbnailFormTemplate
      article: @article

  events:
    'change #edit-thumbnail-image': 'uploadThumbnail'
    'drop #edit-thumbnail-upload': 'toggleThumbnailDragover'
    'click #edit-thumbnail-remove': 'removeThumbnail'

  uploadThumbnail: (e) ->
    gemup e.target.files[0],
      key: sd.GEMINI_KEY
      fail: (err) -> # TODO
      progress: (percent) -> # TODO
      add: (src) =>
        @article.set 'thumbnail_image', src
      done: (src) =>
        img = new Image()
        img.src = src
        img.onload = => @article.save thumbnail_image: src

  removeThumbnail: (e) ->
    e.preventDefault()
    @article.save thumbnail_image: null
