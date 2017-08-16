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
    return fullText.match(/==(\S+.*?)==/ig)

  autolinkText: =>
    linkableText = @getLinkableText()
    console.log linkableText
    async.mapSeries linkableText, (findText, cb) =>
      text = findText.split('==').join('')
      request
        .get("#{sd.ARTSY_URL}/api/search?q=#{encodeURIComponent(text)}")
        .set('X-Access-Token': sd.ACCESS_TOKEN)
        .end (err, res) =>
          if err or res.body.total_count < 1
            return @article.replaceLink(findText, text)
          result = res.body._embedded.results[0]
          link = result._links.permalink.href
          name = result.title
          newLink = @getNewLink(link, name)
          console.log newLink
          @article.replaceLink(findText, newLink)
          cb()

  getNewLink: (link, name) ->
    "<a href='#{link}'>#{name}</a>"
