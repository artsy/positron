_ = require 'underscore'
Backbone = require 'backbone'
Article = require '../../../models/article.coffee'
sd = require('sharify').data
{ spooky } = require '../../../lib/apis.coffee'
{ parse } = require 'url'

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
    'click #edit-save:not(.is-disabled)': 'redirectToList'

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

  redirectToList: ->
    # TODO: We should instead drop down a notice saying
    # "Your post has been saved under 'drafts' [ view drafts ]".
    alert "Saved #{@article.stateName()}!"
    window.location = '/articles?state=' + if @article.get('state') is 'draft' then 0 else 1

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
  done = (article) ->
    new EditView el: $('#layout-content'), article: article
  # Article was fetched server-side. Bootstrap it and inject the url based
  # on it's _links.self
  if sd.ARTICLE.id?
    article = new Article sd.ARTICLE
    url = parse sd.ARTICLE._links.self.href
    article.url = url.protocol + '//' + url.host + url.pathname
    done article
  # Article is new, so we don't know it's url. We have to halbone-crawl to
  # articles and assume that's the right POST endpoint. (Maybe there needs to
  # be a "new" link under /api/articles).
  else
    spooky.get Article, 'articles', (err, articles) ->
      url = parse articles.url
      article = new Article sd.ARTICLE
      article.urlRoot = url.protocol + '//' + url.host + url.pathname
      done article