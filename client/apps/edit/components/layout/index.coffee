_ = require 'underscore'
_s = require 'underscore.string'
Backbone = require 'backbone'
sd = require('sharify').data
User = require '../../../../models/user.coffee'
YoastView = require './components/yoast/index.coffee'
async = require 'async'
request = require 'superagent'

module.exports = class EditLayout extends Backbone.View

  initialize: (options) ->
    { @article, @channel } = options
    @user = new User sd.USER
    @$window = $(window)
    @article.sections.removeBlank()
    @article.sync = _.debounce _.bind(@article.sync, @article), 500
    @article.sections.on 'add remove reset', @addRemoveReset
    @article.on 'missing', @highlightMissingFields
    @article.on 'finished', @onFinished
    @article.on 'loading', @showSpinner
    @article.once 'sync', @onFirstSave if @article.isNew()
    @article.on 'savePublished', @savePublished
    @setupOnBeforeUnload()
    @toggleAstericks()
    @setupYoast() if @channel.isEditorial()
    @$('#edit-sections-spinner').hide()

  onFirstSave: =>
    Backbone.history.navigate "/articles/#{@article.get 'id'}/edit"

  setupOnBeforeUnload: ->
    window.onbeforeunload = =>
      if $.active > 0
        "Your article is not finished saving."
      else if @changedSection is true and not @finished
        "You have unsaved changes, do you wish to continue?"
      else
        null

  serialize: ->
    {
      author_id: @user.get('id')
      title: @article.get 'title'
      thumbnail_title: @$('.edit-title-textarea').val()
      description: @$('.edit-display--magazine .edit-display__description textarea').val()
      social_title: @$('.edit-display--social .edit-display__headline textarea').val()
      social_description: @$('.edit-display--social .edit-display__description textarea').val()
      search_title: @$('.edit-display--search .edit-display__headline textarea').val()
      search_description: @$('.edit-display--search .edit-display__description textarea').val()
      email_metadata:
        headline: @$(".edit-display--email textarea[name='headline']").val()
        author: @$(".edit-display--email input[name='author']").val()
        credit_line: @$(".edit-display--email input[name='credit_line']").val()
        credit_url: @$(".edit-display--email input[name='credit_url']").val()
        image_url: @article.getObjectAttribute('email_metadata','image_url')
        custom_text: @$(".edit-display--email input[name='custom_text']").val()
      send_body: @$('[name=send_body]').is(':checked')
      seo_keyword: @$('input#edit-seo__focus-keyword').val()
    }

  toggleAstericks: =>
    @$('.edit-required ~ :input').each (i, el) =>
      $(el).prevAll('.edit-required').attr 'data-hidden', !!$(el).val()

  redirectToList: =>
    location.assign '/articles?published=' + @article.get('published')

  openTab: (idx) ->
    @$('#edit-tabs a').removeClass('is-active')
    @$("#edit-tabs a:eq(#{idx})").addClass 'is-active'
    @$("#edit-tab-pages > section").hide()
    @$("#edit-tab-pages > section:eq(#{idx})").show()
    @article.trigger "open:tab#{idx}"
    if idx is 2 then @$('#edit-seo').hide() else $('#edit-seo').show()

  showSpinner: =>
    @$('#edit-sections-spinner').show()

  onFinished: =>
    @finished = true
    @showSpinner()
    $(document).ajaxStop @redirectToList

  savePublished: =>
    @article.save @serialize()

  addRemoveReset: =>
    @changedSection = true

  highlightMissingFields: =>
    @openTab 1
    @$window.scrollTop @$window.height()
    @$('#edit-thumbnail-inputs').addClass 'eti-error'
    setTimeout (=> @$('#edit-thumbnail-inputs').removeClass 'eti-error'), 1000

  events:
    'click #edit-tabs > a:not(#edit-publish):not(#autolink-button)': 'toggleTabs'
    'keyup :input:not(.tt-input,.invisible-input, .edit-admin__fields .bordered-input,#edit-seo__focus-keyword), [contenteditable]:not(.tt-input)': 'onKeyup'
    'keyup .edit-display__textarea, #edit-seo__focus-keyword, [contenteditable]:not(.tt-input)': 'onYoastKeyup'
    'dragenter .dashed-file-upload-container': 'toggleDragover'
    'dragleave .dashed-file-upload-container': 'toggleDragover'
    'change .dashed-file-upload-container input[type=file]': 'toggleDragover'
    'blur #edit-title': 'prefillThumbnailTitle'
    'click #autolink-button' : 'autolinkText'

  toggleTabs: (e) ->
    @openTab $(e.target).index()

  setupYoast: ->
    @yoastView = new YoastView
      el: $('#edit-seo')
      article: @article
      contentField: @getBodyText()

  onYoastKeyup: ->
    return unless @channel.isEditorial()
    @yoastView.onKeyup @getBodyText()

  getBodyText: =>
    @fullText = []
    if @article.get('lead_paragraph')?.length
      @fullText.push @article.get('lead_paragraph')
    for section in @article.sections.models when section.get('type') is 'text'
      @fullText.push section.get('body')
    @fullText = @fullText.join()

  onKeyup: =>
    if @article.get('published')
      @changedSection = true
      $('#edit-save').addClass 'attention'
    else
      @article.save @serialize()
    @toggleAstericks()

  toggleDragover: (e) ->
    $(e.currentTarget).closest('.dashed-file-upload-container')
      .toggleClass 'is-dragover'

  getLinkableText: ->
    fullText = @getBodyText()
    fullText.match(/==(\S[^==]*\S)==/ig)

  autolinkText: ->
    $('#autolink-status').addClass('searching').html('Linking...')
    $('#edit-content__overlay').addClass('disabled')
    linkableText = @getLinkableText()
    async.mapLimit linkableText, 5, ((findText, cb) =>
      text = findText.split('==').join('')
      request
        .get("/api/search?term=#{text}")
        .set('X-Access-Token': sd.USER?.access_token)
        .end (err, res) =>
          if err or res.body.total < 1
            @article.replaceLink(findText, text)
            return cb()

          valid_results = @findValidResults(res.body.hits)
          if valid_results.length == 0
            @article.replaceLink(findText, text)
            return cb()

          @article.replaceLink(findText, @getNewLinkFromHits(valid_results) || text)
          return cb()
    ), (err, result) =>
      @article.sections.trigger 'change:autolink'
      $('#autolink-status').removeClass('searching').html('Auto-Link')
      $('#edit-content__overlay').removeClass('disabled')

  findValidResults: (hits) ->
    _.reject(hits, (h) -> h._score < 6.5 || h._source.visible_to_public == false)

  getNewLinkFromHits: (results) ->
    result = results[0]
    name = result._source.name
    link = @findLinkFromResult(result)
    "<a href='#{link}'>#{name}</a>"

  findLinkFromResult: (result) ->
    switch result._type
      when "artist" then "https://artsy.net/artist/#{result._source.slug}"
      when "partner" then "https://artsy.net/#{result._source.slug}"
      when "city" then "https://artsy.net/shows/#{result._source.slug}"
      else null
