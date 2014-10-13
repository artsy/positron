_ = require 'underscore'
_s = require 'underscore.string'
Backbone = require 'backbone'
Article = require '../../../models/article.coffee'
EditHeader = require './header.coffee'
EditThumbnail = require './thumbnail.coffee'
EditSections = require './sections.cjsx'

@EditView = class EditView extends Backbone.View

  initialize: (options) ->
    { @article } = options
    @onKeyup = _.debounce @onKeyup, 100
    @toggleAstericks();
    new EditHeader el: $('#edit-header'), article: @article
    new EditThumbnail el: @$('#edit-thumbnail'), article: @article
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

@init = ->
  new EditView el: $('#layout-content'), article: new Article sd.ARTICLE
  EditSections.init()