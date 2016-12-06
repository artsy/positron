_ = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data
ImageUploadForm = require '../../../../components/image_upload_form/index.coffee'
displayFormTemplate = -> require('./form.jade') arguments...

module.exports = class EditDisplay extends Backbone.View

  initialize: (options) ->
    { @article } = options
    @article.on 'change:title', _.debounce @prefillThumbnailTitle, 3000
    @checkTitleInput()
    @renderThumbnailForms()
    @setCharCounts()

  renderThumbnailForms: =>
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
    'click .edit-display__use-article-title': 'useArticleTitle'
    'change .edit-display--magazine .edit-display__headline': 'checkTitleInput'
    'keyup .edit-display textarea': 'updateCharCount'

  updateCharCount: (e) ->
    if e.target
      e = e.target
    textLength = $(e).data('limit') - e.value.length
    if textLength < 0
      $(e).parent().find('.edit-char-count').addClass('edit-char-count-limit')
    else
      $(e).parent().find('.edit-char-count').removeClass('edit-char-count-limit')
    $(e).parent().find('.edit-char-count').text(textLength + ' Characters')

  setCharCounts: ->
    for input in $( ".edit-display textarea" )
      $(input).trigger 'keyup'

  useArticleTitle: ->
    titleElement = @$('.edit-display__use-article-title').prev()
    titleElement.val(@article.get('title'))
    titleElement.trigger 'keyup'
    @$('.edit-display__use-article-title').hide()
    @article.save thumbnail_title: @article.get('title')

  checkTitleInput: ->
    if $('.edit-display--magazine .edit-display__headline textarea').val() is @article.get('title')
      $('.edit-display__use-article-title').hide()
    else
      $('.edit-display__use-article-title').show()
