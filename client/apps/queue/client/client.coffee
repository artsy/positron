Backbone = require 'backbone'
_ = require 'underscore'
React = require 'react'
{ div, nav, a, h1 } = React.DOM
sd = require('sharify').data
Article = require '../../../models/article.coffee'
FilterSearch = require '../../../components/filter_search/index.coffee'
QueuedArticles = require './queued.coffee'
query = require '../query.coffee'
{ API_URL } = require('sharify').data
request = require 'superagent'

module.exports.QueueView = QueueView = React.createClass

  getInitialState: ->
    publishedArticles: @props.publishedArticles or []
    queuedArticles: @props.queuedArticles or []
    feed: @props.feed or 'daily_email'

  saveSelected: (data, isQueued) ->
    article = new Article
      id: data.id
      channel_id: data.channel_id
      "#{@state.feed}": isQueued
    article.save()

  selected: (article) ->
    published = _.reject @state.publishedArticles, (a) ->
      a.id is article.id
    queued = [article].concat(@state.queuedArticles.slice(0))
    @setState
      publishedArticles: published
      queuedArticles: _.uniq queued, 'id'
    @saveSelected article, true

  unselected: (article) ->
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
    # Refetch queued articles
    queuedQuery = query "#{type}: true"
    request
      .post API_URL + '/graphql'
      .send query: queuedQuery
      .end (err, res) =>
        return if err or not res.body?.data
        @setState queuedArticles: res.body.data.articles

  render: ->
    div {},
      h1 { className: 'page-header' },
        div { className: 'max-width-container' },
          nav {className: 'queue-tabs'},
            a {
              className: "#{if @state.feed is 'daily_email' then 'is-active' else ''} daily-email"
              onClick: => @setFeed 'daily_email'
              }, "Daily Email"
            a {
              className: "#{if @state.feed is 'weekly_email' then 'is-active' else ''} weekly-email"
              onClick: => @setFeed 'weekly_email'
              }, "Weekly Email"
      div {},
        div { className: 'queue-queued max-width-container' },
          QueuedArticles {
            articles: @state.queuedArticles
            headerText: "Queued"
            type: @state.feed
            unselected: @unselected
          }
        div { className: 'queue-filter-search max-width-container' },
          FilterSearch {
            url: sd.API_URL + "/articles?published=true&channel_id=#{sd.CURRENT_CHANNEL.id}&q=%QUERY"
            placeholder: 'Search Articles...'
            articles: @state.publishedArticles
            checkable: true
            headerText: "Latest Articles"
            selected: @selected
            type: @state.feed
            searchResults: @searchResults
          }

module.exports.init = ->
  props =
    publishedArticles: sd.PUBLISHED_ARTICLES
    queuedArticles: sd.QUEUED_ARTICLES
    feed: 'daily_email'
  React.render React.createElement(QueueView, props), document.getElementById('queue-root')
