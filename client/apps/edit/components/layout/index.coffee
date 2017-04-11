_ = require 'underscore'
_s = require 'underscore.string'
Backbone = require 'backbone'
sd = require('sharify').data
User = require '../../../../models/user.coffee'
YoastView = require './components/yoast/index.coffee'

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
    @article.sections.on 'change:layout', => _.defer => @popLockControls()
    @article.on 'savePublished', @savePublished
    @$window.on 'scroll', @popLockControls
    @setupOnBeforeUnload()
    @setupTitleAutosize()
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

  setupTitleAutosize: ->
    @$('#edit-title textarea').autosize()

  serialize: ->
    {
      author_id: @user.get('id')
      title: @$('#edit-title textarea').val()
      thumbnail_title: @$('.edit-title-textarea').val()
      tags: _.reject(
        _.map @$('.edit-admin-tags-input').val()?.split(','), (tag) -> _s.clean tag
        (filled) -> not filled
      )
      description: @$('.edit-display--magazine .edit-display__description textarea').val()
      social_title: @$('.edit-display--social .edit-display__headline textarea').val()
      social_description: @$('.edit-display--social .edit-display__description textarea').val()
      search_title: @$('.edit-display--search .edit-display__headline textarea').val()
      search_description: @$('.edit-display--search .edit-display__description textarea').val()
      email_metadata:
        headline: @$(".edit-display--email textarea[name='headline']").val()
        author: @$(".edit-display--email textarea[name='author']").val()
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
    $('#edit-save').addClass 'attention'

  highlightMissingFields: =>
    @openTab 1
    @$window.scrollTop @$window.height()
    @$('#edit-thumbnail-inputs').addClass 'eti-error'
    setTimeout (=> @$('#edit-thumbnail-inputs').removeClass 'eti-error'), 1000

  events:
    'click #edit-tabs > a:not(#edit-publish)': 'toggleTabs'
    'keyup :input:not(.tt-input,.edit-admin__fields .bordered-input, .edit-display__textarea,#edit-seo__focus-keyword), [contenteditable]:not(.tt-input)': 'onKeyup'
    'keyup .edit-display__textarea, #edit-seo__focus-keyword, [contenteditable]:not(.tt-input)': 'onYoastKeyup'
    'click .edit-section-container *': 'popLockControls'
    'click .edit-section-tool-menu li': -> _.defer => @popLockControls()
    'dragenter .dashed-file-upload-container': 'toggleDragover'
    'dragleave .dashed-file-upload-container': 'toggleDragover'
    'change .dashed-file-upload-container input[type=file]': 'toggleDragover'
    'mouseenter .edit-section-tool': 'toggleSectionTool'
    'mouseleave .edit-section-tool': 'toggleSectionTool'
    'mouseenter .edit-section-container:not([data-editing=true])': 'toggleSectionTools'
    'mouseleave .edit-section-container:not([data-editing=true])': 'hideSectionTools'
    'click .edit-section-container, .edit-section-tool-menu > li': 'hideSectionTools'
    'blur #edit-title': 'prefillThumbnailTitle'

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
    if $(@article.leadParagraph.get('text')).text().length
      @fullText.push @article.leadParagraph.get('text')
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

  popLockControls: =>
    $section = @$('.edit-section-container[data-editing=true]')
    return unless $section.length
    $controls = $section.find('.edit-section-controls')
    $controls.css width: $section.outerWidth(), left: ''
    insideComponent = @$window.scrollTop() + @$('#edit-header').outerHeight() >
      ($section.offset().top or 0) - $controls.height()
    if (@$window.scrollTop() + $controls.outerHeight() >
        $section.offset().top + $section.height())
      insideComponent = false
    left = ($controls.outerWidth() / 2) - ($('#layout-sidebar').width() / 2)
    type = $section.data('type')
    unless type is 'fullscreen' or type is 'callout'
      $controls.css(
        width: if insideComponent then $controls.outerWidth() else ''
        left: if insideComponent then "calc(50% - #{left}px)" else ''
      ).attr('data-fixed', insideComponent)

  toggleDragover: (e) ->
    $(e.currentTarget).closest('.dashed-file-upload-container')
      .toggleClass 'is-dragover'

  toggleSectionTool: (e) ->
    $t = $(e.currentTarget)
    e.preventDefault() if $t.siblings('.edit-section-container').is('[data-editing=true]')
    $t.toggleClass 'is-active'

  toggleSectionTools: (e) ->
    @hideSectionTools()
    $(e.currentTarget).prev('.edit-section-tool').addClass 'is-active'
    $(e.currentTarget).next('.edit-section-tool').addClass 'is-active'

  hideSectionTools: ->
    @$('.edit-section-tool').removeClass 'is-active'
