_ = require 'underscore'
Backbone = require 'backbone'
Article = require '../../../models/article.coffee'
sd = require('sharify').data

@EditView = class EditView extends Backbone.View

  initialize: (options) ->
    { @article } = options
    @autosave = _.debounce @autosave, 500
    new EditHeader el: $('#edit-header'), article: @article
    @toggleAsterisk()

  events:
    'keyup #edit-title input': 'toggleAsterisk'
    'click #edit-tabs > a': 'toggleTabs'
    'keyup :input': 'autosave'

  toggleAsterisk: ->
    fn = if $('#edit-title input').val() is '' then 'show' else 'hide'
    @$('#edit-title .edit-required')[fn]()

  toggleTabs: (e) ->
    idx = $(e.target).index()
    if $(e.currentTarget).is('#edit-publish.is-disabled')
      idx = 1
      @highlightMissingFields()
    @$('#edit-tabs a').removeClass('is-active')
    @$("#edit-tabs a:eq(#{idx})").addClass 'is-active'
    @$("#edit-tab-pages > section").hide()
    @$("#edit-tab-pages > section:eq(#{idx})").show()

  highlightMissingFields: ->
    alert 'Missing data!'
    # TODO: Iterate through empty required inputs and highlight them

  serialize: ->
    {
      title: @$('#edit-title input').val()
    }

  autosave: =>
    @article.save @serialize()

@EditHeader = class EditHeader extends Backbone.View

  initialize: (options) ->
    { @article } = options
    @article.on 'request', @saving
    @article.on 'sync', @doneSaving

  saving: =>
    @$('#edit-save').addClass 'is-saving'

  doneSaving: =>
    @$('#edit-save').removeClass 'is-saving'

@init = ->
  article = new Article sd.ARTICLE
  new EditView el: $('#layout-content'), article: article