_ = require 'underscore'
_s = require 'underscore.string'
Backbone = require 'backbone'
try
  Scribe = require 'scribe-editor'
  scribePluginSanitizer = require '../section_text/sanitizer.coffee'

module.exports = class EditLayout extends Backbone.View

  initialize: (options) ->
    { @article } = options
    @$window = $(window)
    @article.sync = _.debounce _.bind(@article.sync, @article), 500
    @article.sections.on 'change', => @article.save()
    @article.on 'missing', @highlightMissingFields
    @article.on 'finished', @onFinished
    @article.once 'sync', @onFirstSave if @article.isNew()
    @article.sections.on 'change:layout', => _.defer => @popLockControls()
    @$window.on 'scroll', @popLockControls
    @setupOnBeforeUnload()
    @toggleAstericks()
    @attachScribe()
    @$('#edit-sections-spinner').hide()

  onFirstSave: =>
    Backbone.history.navigate "/articles/#{@article.get 'id'}"

  setupOnBeforeUnload: ->
    window.onbeforeunload = =>
      if $.active > 0 then "Your article is not finished saving." else null

  attachScribe: ->
    scribe = new Scribe $('#edit-lead-paragraph')[0]
    scribe.use scribePluginSanitizer
      tags:
        p: true
        b: true
        i: true
        a: { href: true, target: '_blank' }
    @toggleLeadParagraphPlaceholder()

  serialize: ->
    {
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

  onFinished: =>
    @$('#edit-sections-spinner').show()
    @syncTitleTeaser()
    @article.on 'sync', @redirectToList

  highlightMissingFields: =>
    @openTab 1
    @$window.scrollTop @$window.height()
    @$('#edit-thumbnail-inputs').addClass 'eti-error'
    setTimeout (=> @$('#edit-thumbnail-inputs').removeClass 'eti-error'), 1000

  syncTitleTeaser: =>
    unless @article.get 'thumbnail_title'
      @$('#edit-thumbnail-title input')
        .val(@$('#edit-title textarea').val()).trigger 'keyup'
    unless @article.get 'thumbnail_teaser'
      @$('#edit-thumbnail-teaser textarea')
        .val(@$('#edit-lead-paragraph').text()).trigger 'keyup'

  events:
    'click #edit-tabs > a:not(#edit-publish)': 'toggleTabs'
    'keyup :input, [contenteditable]': 'onKeyup'
    'click .edit-section-container *': 'popLockControls'
    'dragenter .dashed-file-upload-container': 'toggleDragover'
    'dragleave .dashed-file-upload-container': 'toggleDragover'
    'change .dashed-file-upload-container input[type=file]': 'toggleDragover'
    'keyup #edit-lead-paragraph': 'toggleLeadParagraphPlaceholder'

  toggleTabs: (e) ->
    @openTab $(e.target).index()
    @syncTitleTeaser()

  onKeyup: =>
    @article.save @serialize()
    @toggleAstericks()

  popLockControls: =>
    $section = @$('.edit-section-container[data-state-editing=true]')
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
    show = @$('#edit-lead-paragraph').text().match(/\w/) is null
    @$('#edit-lead-paragraph')[(if show then 'add' else 'remove') + 'Class'](
      'is-empty'
    )
