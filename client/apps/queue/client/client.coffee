Backbone = require 'backbone'
_ = require 'underscore'
React = require 'react'
{ div, nav, a, h1 } = React.DOM
sd = require('sharify').data
Article = require '../../../models/article.coffee'
FilterSearch = require '../../../components/filter_search/index.coffee'
QueuedArticles = require './queued.coffee'
ArticleList = require '../../../components/article_list/index.coffee'
query = require '../query.coffee'
{ API_URL } = require('sharify').data
Lokka = require('lokka')
Transport = require('lokka-transport-http')

module.exports.QueueView = QueueView = React.createClass

  getInitialState: ->
    publishedArticles: @props.publishedArticles or []
    queuedArticles: @props.queuedArticles or []
    scheduledArticles: @props.scheduledArticles or []
    feed: @props.feed or 'scheduled'

  componentDidMount: ->
    headers =
      'X-Access-Token': sd.USER.get('access_token')
    @client = new Lokka
      transport: new Transport(API_URL + '/graphql', {headers})

  saveSelected: (data, isQueued) ->
    article = new Article
      id: data.id
      channel_id: data.channel_id
      "#{@state.feed}": isQueued
    article.save()

  selected: (article, type) ->
    if type is 'select'
      published = _.reject @state.publishedArticles, (a) ->
        a.id is article.id
      queued = [article].concat(@state.queuedArticles.slice(0))
      @setState
        publishedArticles: published
        queuedArticles: _.uniq queued, 'id'
      @saveSelected article, true
    else
      queued = _.reject @state.queuedArticles, (a) ->
        a.id is article.id
      published = [article].concat(@state.publishedArticles.slice(0))
      @setState
        queuedArticles: queued
        publishedArticles: _.uniq published, 'id'
      @saveSelected article, false

  searchResults: (results) ->
    @setState publishedArticles: results

  setFeed: (type) ->
    @setState feed: type
    # @fetchFeed()

  # fetchFeed: ->
  #   @client.query(query "#{@state.feed}: true, published: true")
  #     .then (result) =>
  #       return if err or not result.body?.data
  #       if @state.feed is 'scheduled'
  #         @setState scheduledArticles: result.body.data.articles
  #       else
  #         @setState queuedArticles: result.body.data.articles
  #         @fetchLatest()

  # fetchLatest: ->
  #   latestQuery = query "channel_id: \"#{sd.CURRENT_CHANNEL.id}\", published: true, sort: \"-published_at\", daily_email: false"
  #   @client.query(latestQuery)
  #     .then (result) =>
  #       return if err or not result.body?.data
  #       @setState publishedArticles: result.body.data.articles

  render: ->
    div {
      'data-state': @state.feed
      className: 'queue-root-container'
    },
      h1 { className: 'page-header' },
        div { className: 'max-width-container' },
          nav {className: 'queue-tabs'},
            a {
              className: "#{if @state.feed is 'scheduled' then 'is-active' else ''} scheduled"
              onClick: => @setFeed 'scheduled'
              }, "Scheduled"
            a {
              className: "#{if @state.feed is 'daily_email' then 'is-active' else ''} daily-email"
              onClick: => @setFeed 'daily_email'
              }, "Daily Email"
            a {
              className: "#{if @state.feed is 'weekly_email' then 'is-active' else ''} weekly-email"
              onClick: => @setFeed 'weekly_email'
              }, "Weekly Email"
      div {},
        div { className: 'queue-scheduled max-width-container'},
          ArticleList {
            articles: @state.scheduledArticles
            headerText: "Scheduled Articles"
            checkable: false
          }
        div { className: 'queue-queued max-width-container' },
          QueuedArticles {
            articles: @state.queuedArticles
            headerText: "Queued"
            selected: @selected
          }
        div { className: 'queue-filter-search max-width-container' },
          FilterSearch {
            url: sd.API_URL + "/articles?published=true&channel_id=#{sd.CURRENT_CHANNEL.id}&q=%QUERY"
            placeholder: 'Search Articles...'
            articles: @state.publishedArticles
            checkable: true
            headerText: "Latest Articles"
            selected: @selected
            searchResults: @searchResults
          }

module.exports.init = ->
  props =
    scheduledArticles: sd.SCHEDULED_ARTICLES
    feed: 'scheduled'
  React.render React.createElement(QueueView, props), document.getElementById('queue-root')
