Backbone = require 'backbone'
_ = require 'underscore'
React = require 'react'
ReactDOM = require 'react-dom'
sd = require('sharify').data
request = require 'superagent'
Tags = require '../../../collections/tags.coffee'
FilterSearch = require '../../../components/filter_search/index.coffee'
{ div, nav, a, h1 } = React.DOM

module.exports = TagsView = React.createClass
  displayName: 'TagsView'

  getInitialState: ->
    internalTags: @props.internalTags or []
    topicTags: @props.topicTags or []
    public: @props.public or true
    loading: false
    errorMessage: ''

  getType: ->
    if @state.public then 'topic' else 'internal'

  # saveSelected: (data, isQueued) ->
  #   article =
  #     id: data.id
  #     channel_id: data.channel_id
  #     "#{@state.feed}": isQueued
  #   @setState loading: true
  #   # Initialize new article with `simple` mode on to prevent default associations
  #   new Article({}, simple: true).save article,
  #     success: =>
  #       @setState loading: false
  #     error: =>
  #       @setState
  #         loading: false
  #         errorMessage: 'There has been an error. Please contact support.'
  #       setTimeout ( => @setState(errorMessage: '')), 2000

  # selected: (article, type) ->
  #   if type is 'select'
  #     published = _.reject @state.publishedArticles, (a) ->
  #       a.id is article.id
  #     queued = [article].concat(@state.queuedArticles.slice(0))
  #     @setState
  #       publishedArticles: published
  #       queuedArticles: _.uniq queued, 'id'
  #     @saveSelected article, true
  #   else
  #     queued = _.reject @state.queuedArticles, (a) ->
  #       a.id is article.id
  #     published = [article].concat(@state.publishedArticles.slice(0))
  #     @setState
  #       queuedArticles: queued
  #       publishedArticles: _.uniq published, 'id'
  #     @saveSelected article, false

  # searchResults: (results) ->
  #   @setState publishedArticles: results

  # setFeed: (type) ->
  #   @setState feed: type
  #   @fetchFeed type

  # fetchFeed: (type) ->
  #   published = type in ['daily_email', 'weekly_email']
  #   feedQuery = query "#{type}: true, published: #{published}, channel_id: \"#{sd.CURRENT_CHANNEL.id}\""
  #   request
  #     .post sd.API_URL + '/graphql'
  #     .set 'X-Access-Token', sd.USER?.access_token
  #     .send query: feedQuery
  #     .end (err, res) =>
  #       return if err or not res.body?.data
  #       if type is 'scheduled'
  #         @setState scheduledArticles: res.body.data.articles
  #       else
  #         @setState queuedArticles: res.body.data.articles
  #         @fetchLatest()

  # fetchLatest: ->
  #   latestQuery = query "channel_id: \"#{sd.CURRENT_CHANNEL.id}\", published: true, sort: \"-published_at\", daily_email: false"
  #   request
  #     .post sd.API_URL + '/graphql'
  #     .set 'X-Access-Token', sd.USER?.access_token
  #     .send query: latestQuery
  #     .end (err, res) =>
  #       return if err or not res.body?.data
  #       @setState publishedArticles: res.body.data.articles

  setResults: (results) ->
    @setState topicTags: results

  render: ->
    div {
      'data-state': @getType()
      className: 'tags-root-container'
      'data-loading': @state.loading
    },
      div { className: 'tags-loading-container'},
        div { className: 'loading-spinner' }
        if @state.errorMessage
          div { className: 'tags-loading__error' }, @state.errorMessage
      h1 { className: 'page-header' },
        div { className: 'max-width-container' },
          nav {className: 'nav-tabs'},
            a {
                className: "#{ if @getType() is 'topic' then 'is-active' else '' } topic"
                # onClick: => @setFeed ''
              }, "Topic Tags"
            a {
                className: "#{ if @getType() is 'internal' then 'is-active' else '' } internal"
                # onClick: => @setFeed ''
              }, "Internal Tags"
      div {},
        div { className: 'tags-topic max-width-container' },
          FilterSearch {
            url: sd.API_URL + "/tags?public=true&q=%QUERY"
            placeholder: 'Search Tags...'
            collection: @props.topicTags
            headerText: "Latest Tags"
            selected: null
            searchResults: @searchResults
            contentType: 'tag'
          }
        # div { className: 'tags-internal max-width-container' },
        #   FilterSearch {
        #     url: sd.API_URL + "/articles?public=false&q=%QUERY"
        #     placeholder: 'Search Tags...'
        #     articles: @state.publishedArticles
        #     display: 'email'
        #     headerText: "Latest Articles"
        #     selected: @selected
        #     searchResults: @searchResults
        #   }

module.exports.init = ->
  props =
    topicTags: sd.TAGS
    public: true
  ReactDOM.render React.createElement(TagsView, props), document.getElementById('tags-root')
