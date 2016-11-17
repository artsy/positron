Backbone = require 'backbone'
_ = require 'underscore'
FilterSearch = require '../../../components/filter_search/index.coffee'
sd = require('sharify').data
Article = require '../../../models/article.coffee'
QueuedArticles = require './queued.coffee'

module.exports.QueueView = class QueueView extends Backbone.View

  initialize: ->
    filter = FilterSearch $('#queue-filter-search')[0],
      url: sd.API_URL + "/articles?published=true&channel_id=#{sd.CURRENT_CHANNEL.id}&q=%QUERY"
      placeholder: 'Search Articles...'
      articles: sd.PUBLISHED_ARTICLES
      checkable: true
      headerText: "Latest Articles"
      selected: @selected
      type: 'daily'

    queued = QueuedArticles $('#queue-queued')[0],
      articles: sd.QUEUED_ARTICLES
      headerText: "Queued"
      type: 'daily'
      unselected: @unselected

  selected: (id, type) ->
    article = new Article id
    console.log article
    console.log type

  unselected: (id, type) ->
    article = new Article id
    console.log article
    console.log type

module.exports.init = ->
  new QueueView el: $('body')
