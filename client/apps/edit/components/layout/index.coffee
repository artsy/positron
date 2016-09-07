_ = require 'underscore'
_s = require 'underscore.string'
Backbone = require 'backbone'
sd = require('sharify').data
User = require '../../../../models/user.coffee'
YoastView = require './components/yoast/index.coffee'
toggleScribePlaceholder = require '../../lib/toggle_scribe_placeholder.coffee'
try
  Scribe = require 'scribe-editor'
  scribePluginSanitizer = require '../../lib/sanitizer.coffee'

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
    @attachScribe()
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

  attachScribe: ->
    scribe = new Scribe @$('#edit-lead-paragraph')[0]
    scribe.use scribePluginSanitizer
      tags:
        p: true
        b: true
        i: true
        br: true
        a: { href: true, target: '_blank' }
    @toggleLeadParagraphPlaceholder()

  serialize: ->
    {
      author_id: @user.get('id')
      author:
        name: @$('#edit-admin-change-author :input').val() or @channel.get('name')
        id: @user.get('id')
      tier: Number @$('[name=tier]:checked').val()
      featured: @$('[name=featured]').is(':checked')
      exclude_google_news: @$('[name=exclude_google_news]').is(':checked')
      title: @$('#edit-title textarea').val()
      lead_paragraph: @$('#edit-lead-paragraph').html()
      thumbnail_title: @$('#edit-thumbnail-title :input').val()
      thumbnail_teaser: @$('#edit-thumbnail-teaser :input').val()
      tags: _.reject(
        _.map @$('.edit-admin-tags-input').val().split(','), (tag) -> _s.clean tag
        (filled) -> not filled
      )
      description: @$('.edit-admin-description-input').val()
      email_metadata:
        headline: @$(".edit-email-form input[name='headline']").val()
        author: @$(".edit-email-form input[name='author']").val()
        credit_line: @$(".edit-email-form input[name='credit_line']").val()
        credit_url: @$(".edit-email-form input[name='credit_url']").val()
        image_url: @article.getObjectAttribute('email_metadata','image_url')
        custom_text: @$(".edit-email-form input[name='custom_text']").val()
      is_super_article: @$('[name=is_super_article]').is(':checked')
      super_article:
        partner_link: @$("#edit-super-article input[name='partner_link']").val()
        partner_logo: @article.getObjectAttribute 'super_article', 'partner_logo'
        partner_link_title: @$("#edit-super-article input[name='partner_link_title']").val()
        partner_logo_link: @$("#edit-super-article input[name='partner_logo_link']").val()
        partner_fullscreen_header_logo: @article.getObjectAttribute 'super_article', 'partner_fullscreen_header_logo'
        secondary_partner_logo: @article.getObjectAttribute 'super_article', 'secondary_partner_logo'
        secondary_logo_text: @$("#edit-super-article input[name='secondary_logo_text']").val()
        secondary_logo_link: @$("#edit-super-article input[name='secondary_logo_link']").val()
        footer_blurb: @$("#edit-super-article textarea[name='footer_blurb']").val()
        related_articles: if @article.get('super_article')?.related_articles then @article.get('super_article').related_articles else []
      send_body: @$('[name=send_body]').is(':checked')
      layout: @$('[name=layout]:checked').val()
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
    'keyup :input:not(.tt-input), [contenteditable]:not(.tt-input)': 'onKeyup'
    'change #edit-admin :input': 'onKeyup'
    'click .edit-section-container *': 'popLockControls'
    'click .edit-section-tool-menu li': -> _.defer => @popLockControls()
    'dragenter .dashed-file-upload-container': 'toggleDragover'
    'dragleave .dashed-file-upload-container': 'toggleDragover'
    'change .dashed-file-upload-container input[type=file]': 'toggleDragover'
    'keyup #edit-lead-paragraph': 'toggleLeadParagraphPlaceholder'
    'mouseenter .edit-section-tool': 'toggleSectionTool'
    'mouseleave .edit-section-tool': 'toggleSectionTool'
    'mouseenter .edit-section-container:not([data-editing=true])': 'toggleSectionTools'
    'mouseleave .edit-section-container:not([data-editing=true])': 'hideSectionTools'
    'click .edit-section-container, .edit-section-tool-menu > li': 'hideSectionTools'
    'blur #edit-title': 'prefillThumbnailTitle'
    'click #seoButton': 'checkSeo'

  toggleTabs: (e) ->
    @openTab $(e.target).index()

  checkSeo: =>
    imageCount = 0
    textIndex = 0
    @fullText = []
    if $(@article.get('lead_paragraph')).text()
      @fullText.push(' <p> ' + $(@article.get('lead_paragraph')).text() + ' </p> ')
      textIndex += 1

    for section in $(@article.get('sections'))
      if section.type is 'text' && textIndex is 0
        @fullText.push(
          ' <p> ' + 
          $(section.body)
          .find('p')
          .andSelf()
          .filter('p:first')
          .text()
           + ' </p> ')
        @fullText.push(
          $(section.body)
          .find('p')
          .andSelf()
          .filter('p:not(:first)')
          .text())
        textIndex += 1
      else if section.type is 'text'
        @fullText.push($((section.body).replace(/<\/p>/g," </p>")).text())
      else if section.type is 'artworks'
        imageCount += 1
      else if section.type is 'image'
        imageCount += 1
    @fullText.push('<img></img>') for num in [imageCount..1]
    @fullText = @fullText.join(' ')
    
    @yoastTitle = ''
    if @article.get('thumbnail_title')
      @yoastTitle = @article.get('thumbnail_title')
    else
      @yoastTitle = @article.get('title')

    yoastView = new YoastView
      contentField: @fullText
      title: @yoastTitle
      slug: @article.getSlug()

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

  toggleLeadParagraphPlaceholder: ->
    toggleScribePlaceholder @$('#edit-lead-paragraph')

  toggleSectionTool: (e) ->
    $t = $(e.currentTarget)
    return if $t.siblings('.edit-section-container').is('[data-editing=true]')
    $t.toggleClass 'is-active'

  toggleSectionTools: (e) ->
    @hideSectionTools()
    $(e.currentTarget).prev('.edit-section-tool').addClass 'is-active'
    $(e.currentTarget).next('.edit-section-tool').addClass 'is-active'

  hideSectionTools: ->
    @$('.edit-section-tool').removeClass 'is-active'
