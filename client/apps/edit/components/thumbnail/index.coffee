_ = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data
ImageUploadForm = require '../../../../components/image_upload_form/index.coffee'
thumbnailFormTemplate = -> require('./form.jade') arguments...

module.exports = class EditThumbnail extends Backbone.View

  initialize: (options) ->
    { @article } = options
    @article.on 'change:title', _.debounce @prefillThumbnailTitle, 3000
    @checkTitleTextarea()
    @renderThumbnailForm()
    @updateCharCount()

  renderThumbnailForm: =>
    new ImageUploadForm
      el: $('#edit-thumbnail-upload')
      src: @article.get('thumbnail_image')
      remove: =>
        @article.save thumbnail_image: null
      done: (src) =>
        @article.save thumbnail_image: src

  prefillThumbnailTitle: =>
    if @article.get('title') and not @article.get('thumbnail_title')
      @useArticleTitle()

  events:
    'click .edit-use-article-title': 'useArticleTitle'
    'change .edit-title-textarea': 'checkTitleTextarea'
    'keyup .edit-title-textarea': 'updateCharCount'

  useArticleTitle: (e) ->
    e?.preventDefault()
    @$('.edit-use-article-title').next().val(@article.get('title'))
    @$('.edit-use-article-title').hide()
    @updateCharCount()
    @article.save thumbnail_title: @article.get('title')

  checkTitleTextarea: ->
    if $('.edit-title-textarea').val() is @article.get('title')
      $('.edit-use-article-title').hide()
    else
      $('.edit-use-article-title').show()

  updateCharCount: ->
    textLength = 97 - $('.edit-title-textarea').val().length
    if textLength < 0
      $('.edit-char-count').addClass('edit-char-count-limit')
    else
      $('.edit-char-count').removeClass('edit-char-count-limit')
    $('.edit-char-count').text(textLength)
