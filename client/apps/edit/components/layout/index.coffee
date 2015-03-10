_ = require 'underscore'
_s = require 'underscore.string'
Backbone = require 'backbone'
sd = require('sharify').data
CurrentUser = require '../../../../models/current_user.coffee'
toggleScribePlaceholder = require '../../lib/toggle_scribe_placeholder.coffee'
try
  Scribe = require 'scribe-editor'
  scribePluginSanitizer = require '../../lib/sanitizer.coffee'

module.exports = class EditLayout extends Backbone.View

  initialize: (options) ->
    { @article } = options
    @user = new CurrentUser sd.USER
    @$window = $(window)
    @article.sync = _.debounce _.bind(@article.sync, @article), 500
    @article.sections.on 'change', => @article.save()
    @article.on 'missing', @highlightMissingFields
    @article.on 'finished', @onFinished
    @article.on 'loading', @showSpinner
    @article.on 'finished open:tab1', @syncTitleTeaser
    @article.once 'sync', @onFirstSave if @article.isNew()
    @article.sections.on 'change:layout', => _.defer => @popLockControls()
    @$window.on 'scroll', @popLockControls
    @setupOnBeforeUnload()
    @setupTitleAutosize()
    @toggleAstericks()
    @attachScribe()
    @$('#edit-sections-spinner').hide()

  syncTitleTeaser: =>
    unless @article.get 'thumbnail_title'
      @$('#edit-thumbnail-title input')
        .val(@$('#edit-title textarea').val()).trigger 'keyup'
    unless @article.get 'thumbnail_teaser'
      @$('#edit-thumbnail-teaser textarea')
        .val(@$('#edit-lead-paragraph').text()).trigger 'keyup'

  onFirstSave: =>
    Backbone.history.navigate "/articles/#{@article.get 'id'}/edit"

  setupOnBeforeUnload: ->
    window.onbeforeunload = =>
      if $.active > 0 then "Your article is not finished saving." else null

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
      tier: Number @$('[name=tier]:checked').val()
      title: @$('#edit-title textarea').val()
      lead_paragraph: @$('#edit-lead-paragraph').html()
      thumbnail_title: @$('#edit-thumbnail-title :input').val()
      thumbnail_teaser: @$('#edit-thumbnail-teaser :input').val()
      tags: _.reject(
        _s.clean(@$('#edit-thumbnail-tags input').val()).split(',')
        (filled) -> not filled
      )
    }

  toggleAstericks: =>
    @$('.edit-required + :input').each (i, el) =>
      $(el).prev('.edit-required').attr 'data-hidden', !!$(el).val()

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
    @showSpinner()
    $(document).ajaxStop @redirectToList

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
    'dragenter .dashed-file-upload-container': 'toggleDragover'
    'dragleave .dashed-file-upload-container': 'toggleDragover'
    'change .dashed-file-upload-container input[type=file]': 'toggleDragover'
    'keyup #edit-lead-paragraph': 'toggleLeadParagraphPlaceholder'
    'mouseenter .edit-section-tool': 'toggleSectionTool'
    'mouseleave .edit-section-tool': 'toggleSectionTool'
    'mouseenter .edit-section-container:not([data-editing=true])': 'toggleSectionTools'
    'mouseleave .edit-section-container:not([data-editing=true])': 'hideSectionTools'
    'click .edit-section-container, .edit-section-tool-menu > li': 'hideSectionTools'

  toggleTabs: (e) ->
    @openTab $(e.target).index()

  onKeyup: =>
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
