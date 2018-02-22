Backbone = require 'backbone'
_ = require 'underscore'
React = require 'react'
ReactDOM = require 'react-dom'
{ div, nav, a, h1 } = React.DOM
Article = require '../../../models/article.coffee'
FilterSearch = React.createFactory require '../../../components/filter_search/index.coffee'
QueuedArticles = React.createFactory require './queued.coffee'
ArticleList = React.createFactory require('../../../components/article_list').ArticleList
query = require '../query.coffee'
sd = require('sharify').data
request = require 'superagent'

module.exports.QueueView = QueueView = React.createClass
  displayName: 'QueueView'

  getInitialState: ->
    publishedArticles: @props.publishedArticles or []
    queuedArticles: @props.queuedArticles or []
    scheduledArticles: @props.scheduledArticles or []
    feed: @props.feed or 'scheduled'
    loading: false
    errorMessage: ''

  saveSelected: (data, isQueued) ->
    article =
      id: data.id
      channel_id: data.channel_id
      "#{@state.feed}": isQueued
    @setState loading: true
    # Initialize new article with `simple` mode on to prevent default associations
    new Article({}, simple: true).save article,
      success: =>
        @setState loading: false
      error: =>
        @setState
          loading: false
          errorMessage: 'There has been an error. Please contact support.'
        setTimeout ( => @setState(errorMessage: '')), 2000

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
    @fetchFeed type

  fetchFeed: (type) ->
    published = type in ['daily_email', 'weekly_email']
    feedQuery = query "#{type}: true, published: #{published}, channel_id: \"#{sd.CURRENT_CHANNEL.id}\""
    request
      .post sd.API_URL + '/graphql'
      .set 'X-Access-Token', sd.USER?.access_token
      .send query: feedQuery
      .end (err, res) =>
        return if err or not res.body?.data
        if type is 'scheduled'
          @setState scheduledArticles: res.body.data.articles
        else
          @setState queuedArticles: res.body.data.articles
          @fetchLatest()

  fetchLatest: ->
    latestQuery = query "channel_id: \"#{sd.CURRENT_CHANNEL.id}\", published: true, sort: \"-published_at\", daily_email: false"
    request
      .post sd.API_URL + '/graphql'
      .set 'X-Access-Token', sd.USER?.access_token
      .send query: latestQuery
      .end (err, res) =>
        return if err or not res.body?.data
        @setState publishedArticles: res.body.data.articles

  render: ->
    div {
      'data-state': @state.feed
      className: 'queue-root-container'
      'data-loading': @state.loading
    },
      div { className: 'queue-loading-container'},
        div { className: 'loading-spinner' }
        if @state.errorMessage
          div { className: 'flash-error' }, @state.errorMessage
      h1 { className: 'page-header' },
        div { className: 'max-width-container' },
          nav {className: 'nav-tabs'},
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
          div {className: 'channel-name'}, "#{@props.channel.name}"
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
            checkable: true
            selected: @selected
          }
        div { className: 'queue-filter-search max-width-container' },
          FilterSearch {
            url: sd.API_URL + "/articles?published=true&channel_id=#{sd.CURRENT_CHANNEL.id}&q=%QUERY"
            placeholder: 'Search Articles...'
            collection: @state.publishedArticles
            checkable: true
            display: 'email'
            headerText: "Latest Articles"
            selected: @selected
            searchResults: @searchResults
            contentType: 'article'
          }

module.exports.init = ->
  props =
    scheduledArticles: sd.SCHEDULED_ARTICLES
    feed: 'scheduled'
    channel: sd.CURRENT_CHANNEL
  ReactDOM.render React.createElement(QueueView, props), document.getElementById('queue-root')
