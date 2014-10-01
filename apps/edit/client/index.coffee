Backbone = require 'backbone'

@EditView = class EditView extends Backbone.View

  initialize: ->
    @toggleAsterisk()

  events:
    'keyup #edit-title input': 'toggleAsterisk'
    'click #edit-tabs > a': 'toggleTabs'

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


@init = ->
  new EditView el: $ '#layout-content'
