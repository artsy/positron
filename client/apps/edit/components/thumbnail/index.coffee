_ = require 'underscore'
Backbone = require 'backbone'
gemup = require 'gemup'
sd = require('sharify').data
ImageUploadForm = require '../../../../components/image_upload_form/index.coffee'
thumbnailFormTemplate = -> require('./form.jade') arguments...

module.exports = class EditThumbnail extends Backbone.View

  initialize: (options) ->
    { @article } = options
    @article.on 'change:title', _.debounce @prefillThumbnailTitle, 3000
    @checkTitleTextarea()
    @renderThumbnailForm()
    @setupEmailForm()

  renderThumbnailForm: =>
    new ImageUploadForm
      el: $('#edit-thumbnail-upload')
      src: @article.get('thumbnail_image')
      remove: =>
        console.log 'remove'
        @article.save thumbnail_image: null
      done: (src) =>
        console.log 'done', src
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

  setupEmailForm: ->
    $('.edit-email-checkbox').change ->
      $('.edit-email-form').show()