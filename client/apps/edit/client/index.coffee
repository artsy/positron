_ = require 'underscore'
Backbone = require 'backbone'
Article = require '../../../models/article.coffee'
sd = require('sharify').data
{ parse } = require 'url'

@EditView = class EditView extends Backbone.View

  initialize: (options) ->
    { @article } = options
    @onKeyup = _.debounce @onKeyup, 100
    @toggleAstericks();
    new EditHeader el: $('#edit-header'), article: @article
    @article.on 'destroy', @redirectToList

  highlightMissingFields: ->
    alert 'Missing data!'
    # TODO: Iterate through empty required inputs and highlight them

  serialize: ->
    {
      title: @$('#edit-title input').val()
      lead_paragraph: @$('#edit-lead-paragraph input').val()
      thumbnail_image: @$('#edit-thumbnail-image :input').val()
      thumbnail_title: @$('#edit-thumbnail-title :input').val()
      thumbnail_teaser: @$('#edit-thumbnail-teaser :input').val()
      tags: @$('#edit-thumbnail-tags input').val().split(',')
    }

  toggleAstericks: =>
    @$('.edit-required').each (i, el) =>
      $(el).attr 'data-hidden', !!$(el).siblings(':input').val()

  redirectToList: =>
    location.assign '/articles?published=' + @article.get('published')

  events:
    'click #edit-tabs > a': 'toggleTabs'
    'click #edit-save:not(.is-disabled)': 'save'
    'keyup :input': 'onKeyup'

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
    @redirectToList()

  onKeyup: =>
    @article.save @serialize()
    @toggleAstericks()

@EditHeader = class EditHeader extends Backbone.View

  initialize: (options) ->
    { @article } = options
    @article.on 'request', @saving
    @article.on 'sync', @doneSaving

  saving: =>
    @$('#edit-save').addClass 'is-saving'

  doneSaving: =>
    @$('#edit-save').removeClass 'is-saving'

  events:
    'click #edit-delete': 'delete'

  delete: ->
    return unless confirm "Are you sure?" # TODO: Implement Artsy branded dialog
    @article.destroy()

@EditThumbnail = class EditThumbnail extends Backbone.View



@init = ->
  new EditView el: $('#layout-content'), article: new Article sd.ARTICLE