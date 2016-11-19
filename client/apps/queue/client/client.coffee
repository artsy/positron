Backbone = require 'backbone'
_ = require 'underscore'
FilterSearch = require '../../../components/filter_search/index.coffee'
sd = require('sharify').data
Article = require '../../../models/article.coffee'
QueuedArticles = require './queued.coffee'

module.exports.QueueView = class QueueView extends Backbone.View

  initialize: ->
    @publishedArticles = sd.PUBLISHED_ARTICLES
    @queuedArticles = sd.QUEUED_ARTICLES

    @filter = FilterSearch $('#queue-filter-search')[0],
      url: sd.API_URL + "/articles?published=true&channel_id=#{sd.CURRENT_CHANNEL.id}&q=%QUERY"
      placeholder: 'Search Articles...'
      articles: @publishedArticles
      checkable: true
      headerText: "Latest Articles"
      selected: @selected
      type: 'daily'

    @queued = QueuedArticles $('#queue-queued')[0],
      articles: @queuedArticles
      headerText: "Queued"
      type: 'daily'
      unselected: @unselected

  selected: (id) =>
    article = new Article id
    @publishedArticles = _.reject @publishedArticles, (a) ->
      a.id is id
    @filter.props.articles = @publishedArticles

  unselected: (id) =>
    console.log id
    article = new Article id

  searchResults: (results) =>
    @publishedArticles = results
    @filter.props.articles = @publishedArticles

module.exports.init = ->
  new QueueView el: $('body')
