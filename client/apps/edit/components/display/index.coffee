_ = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data
ImageUploadForm = require '../../../../components/image_upload_form/index.coffee'
{ crop } = require '../../../../components/resizer/index.coffee'
moment = require 'moment'
displayFormTemplate = -> require('./form.jade') arguments...
magazinePreview = -> require('./templates/magazine_preview.jade') arguments...
socialPreview = -> require('./templates/social_preview.jade') arguments...
searchPreview = -> require('./templates/search_preview.jade') arguments...
emailPreview = -> require('./templates/email_preview.jade') arguments...

module.exports = class EditDisplay extends Backbone.View

  initialize: (options) ->
    { @article } = options
    @article.on 'change:title', _.debounce @prefillThumbnailTitle, 3000
    @checkTitleInput()
    @renderThumbnailForms()
    @setCharCounts()
    $('.edit-display__inputs').first().slideDown().prev().addClass('active')
    # @renderArticle = @article.clone()

  renderThumbnailForms: =>
    $magImage = $('.edit-display--magazine .edit-display__image-upload')
    new ImageUploadForm
      el: $magImage
      src: @article.get('thumbnail_image')
      remove: =>
        @article.save thumbnail_image: null
        $($magImage).find('.image-upload-hidden-input').trigger 'change'
      done: (src) =>
        @article.save thumbnail_image: src
        $($magImage).find('.image-upload-hidden-input').trigger 'change'

    $socialImage = $('.edit-display--social .edit-display__image-upload')
    new ImageUploadForm
      el: $socialImage
      src: @article.get('social_image')
      remove: =>
        @article.save social_image: null
        $($socialImage).find('.image-upload-hidden-input').trigger 'change'
      done: (src) =>
        @article.save social_image: src
        $($socialImage).find('.image-upload-hidden-input').trigger 'change'

    $emailImage = $('.edit-display--email .edit-display__image-upload')
    new ImageUploadForm
      el: $emailImage
      src: @article.get('email_metadata')?.image_url
      remove: =>
        emailMetadata = @article.get('email_metadata') or {}
        emailMetadata.image_url = ''
        @article.save email_metadata: emailMetadata
        $($emailImage).find('.image-upload-hidden-input').trigger 'change'
      done: (src) =>
        emailMetadata = @article.get('email_metadata') or {}
        emailMetadata.image_url = src
        @article.save email_metadata: emailMetadata
        $($emailImage).find('.image-upload-hidden-input').trigger 'change'

    $partnerImage = $('.edit-display--partner .edit-display__image-upload')
    new ImageUploadForm
      el: $partnerImage
      src: @article.get('thumbnail_image')
      remove: =>
        @article.save thumbnail_image: null
      done: (src) =>
        @article.save thumbnail_image: src

  prefillThumbnailTitle: =>
    if @article.get('title') and not @article.get('thumbnail_title')
      @useArticleTitle()

  events:
    'click .edit-display__use-article-title': 'useArticleTitle'
    'change .edit-display--magazine .edit-display__headline': 'checkTitleInput'
    'keyup .edit-display textarea': 'onKeyup'
    'change .edit-display .image-upload-hidden-input': 'renderPreviews'
    'click .edit-display__section-title': 'revealSection'

  onKeyup: (e, initial = false) ->
    @updateCharCount e
    @renderPreviews e unless initial

  updateCharCount: (e) ->
    if e.target
      e = e.target
    textLength = $(e).data('limit') - e.value.length
    if textLength < 0
      $(e).parent().find('.edit-char-count').addClass('edit-char-count-limit')
    else
      $(e).parent().find('.edit-char-count').removeClass('edit-char-count-limit')
    $(e).parent().find('.edit-char-count').text(textLength + ' Characters')

  renderPreviews: (e, img) ->
    # Pluck out the value that needs to be set
    dataValue = $(e.target).data('value')
    if dataValue in ['headline','author']
      emailMetadata = @article.get('email_metadata') or {}
      emailMetadata[dataValue] = $(e.target).val()
      @article.set { email_metadata: emailMetadata }, silent: true
    else if dataValue
      @article.set { "#{dataValue}": $(e.target).val() }, silent: true

    # Rerenders all the previews
    $('.edit-display--magazine .edit-display__preview').html magazinePreview
      article: @article
      crop: crop
    $('.edit-display--social .edit-display__preview').html socialPreview
      article: @article
      crop: crop
    $('.edit-display--search .edit-display__preview').html searchPreview
      article: @article
    $('.edit-display--email .edit-display__preview').html emailPreview
      article: @article
      crop: crop

  setCharCounts: ->
    for input in $( ".edit-display textarea" )
      $(input).trigger 'keyup', true

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

  revealSection: (e) ->
    $title = $(e.target).closest('.edit-display__section-title')
    $title.toggleClass('active')
    $($title).next().slideToggle()
