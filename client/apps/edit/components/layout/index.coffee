_ = require 'underscore'
_s = require 'underscore.string'
Backbone = require 'backbone'

module.exports = class EditLayout extends Backbone.View

  initialize: (options) ->
    { @article } = options
    @$window = $(window)
    @onKeyup = _.debounce @onKeyup, 2000
    @$window.on 'scroll', _.throttle @poplockControls, 100
    @toggleAstericks()
    @article.on 'destroy', @redirectToList

  serialize: ->
    {
      title: @$('#edit-title input').val()
      lead_paragraph: @$('#edit-lead-paragraph input').val()
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
    'keyup :input': 'onKeyup'
    'click #edit-sections *': 'onKeyup'
    'click .edit-section-container *': 'poplockControls'

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
    # TODO: We should instead drop down a notice saying
    # "Your article has been saved under 'drafts' [ view drafts ]".
    alert "Saved #{@article.stateName()}!"
    @article.save complete: => @redirectToList()

  onKeyup: =>
    @article.save @serialize()
    @toggleAstericks()

  poplockControls: =>
    $section = @$('.edit-section-container[data-state-editing=true]')
    return unless $section.length
    $controls = $section.find('.edit-section-controls')
    scrolledPast = @$window.scrollTop() + @$('#edit-header').outerHeight() >
      $section.offset().top - $controls.height()
    left = ($controls.width() / 2) - ($('#layout-sidebar').width() / 2)
    $controls.css(
      width: if scrolledPast then $controls.width() else ''
      left: if scrolledPast then "calc(50% - #{left}px)" else ''
    ).attr('data-fixed', scrolledPast)