_ = require 'underscore'
Backbone = require 'backbone'
gemup = require 'gemup'
sd = require('sharify').data
ImageUploadForm = require '../../../../components/image_upload_form/index.coffee'
{ crop, resize } = require('embedly-view-helpers')(sd.EMBEDLY_KEY)
thumbnailFormTemplate = -> require('./form.jade') arguments...

module.exports = class EditThumbnail extends Backbone.View

  initialize: (options) ->
    { @article } = options
    @article.on 'change:title', _.debounce @prefillThumbnailTitle, 3000
    @checkTitleTextarea()
    @renderThumbnailForm()
    @setupEmailMetadata()

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

  useArticleTitle: (e) ->
    e?.preventDefault()
    @$('.edit-use-article-title').next().val(@article.get('title'))
    @$('.edit-use-article-title').hide()
    @article.save thumbnail_title: @article.get('title')

  checkTitleTextarea: ->
    if $('.edit-title-textarea').val() is @article.get('title')
      $('.edit-use-article-title').hide()
    else
      $('.edit-use-article-title').show()

  setupEmailMetadata: ->
    new ImageUploadForm
      el: $('#edit-email-upload')
      src: @article.get('email_metadata')?.small_image_url
      remove: =>
        emailMetadata = @article.get('email_metadata') || {}
        emailMetadata.large_image_url = ''
        emailMetadata.small_image_url = ''
        $('.edit-email-large-image-url span').text ''
        $('.edit-email-small-image-url span').text ''
        @article.save email_metadata: emailMetadata
      done: (src) =>
        emailMetadata = @article.get('email_metadata') || {}
        emailMetadata.large_image_url = crop(src, { width: 1280, height: 960 } )
        emailMetadata.small_image_url = crop(src, { width: 552, height: 392 } )
        $('.edit-email-large-image-url span').text emailMetadata.large_image_url
        $('.edit-email-small-image-url span').text emailMetadata.small_image_url
        @article.save email_metadata: emailMetadata
