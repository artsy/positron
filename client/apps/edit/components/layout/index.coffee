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
    @article.sync = _.debounce _.bind(@article.sync, @article), 1000
    @article.sections.on 'change', => @article.save()
    @$window.on 'scroll', _.throttle @popLockControls, 100
    @toggleAstericks()
    @attachScribe()
    @article.on 'destroy', @redirectToList
    @$('#edit-sections-spinner').remove()

  attachScribe: ->
    scribe = new Scribe $('#edit-lead-paragraph')[0]
    scribe.use scribePluginSanitizer
      tags:
        p: true
        b: true
        i: true
        a: { href: true, target: '_blank' }
    @toggleLeadParagraphPlaceholder()

  toggleLeadParagraphPlaceholder: ->
    show = @$('#edit-lead-paragraph').text().match(/\w/) is null
    @$('#edit-lead-paragraph')[(if show then 'add' else 'remove') + 'Class'](
      'is-empty'
    )

  serialize: ->
    {
      title: @$('#edit-title input').val()
      lead_paragraph: @$('#edit-lead-paragraph').html()
      thumbnail_image: @$('#edit-thumbnail-image :input').val()
      thumbnail_title: @$('#edit-thumbnail-title :input').val()
      thumbnail_teaser: @$('#edit-thumbnail-teaser :input').val()
      tags: _.reject(
        _s.clean(@$('#edit-thumbnail-tags input').val()).split(',')
        (filled) -> not filled
      )
    }

  highlightMissingFields: ->
    alert 'missing fields'

  toggleAstericks: =>
    @$('.edit-required + :input').each (i, el) =>
      $(el).prev('.edit-required').attr 'data-hidden', !!$(el).val()

  redirectToList: =>
    location.assign '/articles?published=' + @article.get('published')

  events:
    'click #edit-tabs > a': 'toggleTabs'
    'click #edit-save:not(.is-disabled)': 'save'
    'keyup :input, [contenteditable]': 'onKeyup'
    'click #edit-sections *': 'onKeyup'
    'click .edit-section-container *': 'popLockControls'
    'dragenter .dashed-file-upload-container': 'toggleDragover'
    'dragleave .dashed-file-upload-container': 'toggleDragover'
    'change .dashed-file-upload-container input[type=file]': 'toggleDragover'
    'keyup #edit-lead-paragraph': 'toggleLeadParagraphPlaceholder'

  toggleTabs: (e) ->
    idx = $(e.target).index()
    if $(e.currentTarget).is('#edit-publish.is-disabled')
      idx = 1
      @highlightMissingFields()
    @$('#edit-tabs a').removeClass('is-active')
    @$("#edit-tabs a:eq(#{idx})").addClass 'is-active'
    @$("#edit-tab-pages > section").hide()
    @$("#edit-tab-pages > section:eq(#{idx})").show()

  save: ->
    @article.save @serialize(), complete: => @redirectToList()

  onKeyup: =>
    @article.save @serialize()
    @toggleAstericks()

  popLockControls: =>
    $section = @$('.edit-section-container[data-state-editing=true]')
    return unless $section.length
    $controls = $section.find('.edit-section-controls')
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