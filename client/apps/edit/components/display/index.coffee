_ = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data
ImageUploadForm = require '../../../../components/image_upload_form/index.coffee'
displayFormTemplate = -> require('./form.jade') arguments...

module.exports = class EditDisplay extends Backbone.View

  initialize: (options) ->
    { @article } = options
    @article.on 'change:title', _.debounce @prefillThumbnailTitle, 3000
    @checkTitleTextarea()
    @renderThumbnailForm()
    @updateCharCount()

  renderThumbnailForm: =>
    new ImageUploadForm
      el: $('.edit-display--magazine .edit-display__image-upload')
      src: @article.get('thumbnail_image')
      remove: =>
        @article.save thumbnail_image: null
      done: (src) =>
        @article.save thumbnail_image: src

    new ImageUploadForm
      el: $('.edit-display--social .edit-display__image-upload')
      src: @article.get('social_image')
      remove: =>
        @article.save social_image: null
      done: (src) =>
        @article.save social_image: src

    new ImageUploadForm
      el: $('.edit-display--email .edit-display__image-upload')
      src: @article.get('email_metadata')?.image_url
      remove: =>
        emailMetadata = @article.get('email_metadata') or {}
        emailMetadata.image_url = ''
        @article.save email_metadata: emailMetadata
      done: (src) =>
        emailMetadata = @article.get('email_metadata') or {}
        emailMetadata.image_url = src
        @article.save email_metadata: emailMetadata

  prefillThumbnailTitle: =>
    if @article.get('title') and not @article.get('thumbnail_title')
      @useArticleTitle()

  events:
    'click .edit-use-article-title': 'useArticleTitle'
    'change .edit-display--magazine .edit-display__headline': 'checkTitleTextarea'
    'keyup .edit-display--magazine .edit-display__headline': 'updateCharCount'

  useArticleTitle: (e) ->
    e?.preventDefault()
    @$('.edit-use-article-title').next().val(@article.get('title'))
    @$('.edit-use-article-title').hide()
    @updateCharCount()
    @article.save thumbnail_title: @article.get('title')

  checkTitleTextarea: ->
    if $('.edit-display--magazine .edit-display__headline input').val() is @article.get('title')
      $('.edit-use-article-title').hide()
    else
      $('.edit-use-article-title').show()

  updateCharCount: ->
    textLength = 130 - $('.edit-display--magazine .edit-display__headline input').val().length
    if textLength < 0
      $('.edit-char-count').addClass('edit-char-count-limit')
    else
      $('.edit-char-count').removeClass('edit-char-count-limit')
    $('.edit-char-count').text(textLength)
