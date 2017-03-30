Backbone = require 'backbone'
_ = require 'underscore'
React = require 'react'
ReactDOM = require 'react-dom'
sd = require('sharify').data
request = require 'superagent'
Tags = require '../../../collections/tags.coffee'
FilterSearch = React.createFactory require '../../../components/filter_search/index.coffee'
query = require './tagsQuery.coffee'
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

  searchResults: (results) ->

  setResults: (results) ->
    @setState topicTags: results

  setPublic: (isPublic) ->
    @setState public: isPublic
    @fetchTags isPublic

  fetchTags: (isPublic) ->
    tagQuery = query "published: #{isPublic}"
    request
      .post sd.API_URL + '/graphql'
      .set 'X-Access-Token', sd.USER?.access_token
      .send query: tagQuery
      .end (err, res) =>
        return if err or not res.body?.data
        if isPublic
          @setState topicTags: res.body.data.tags
        else
          @setState internalTags: res.body.data.tags

  getActiveState: (type) ->
    if @getType() is type then 'is-active' else ''

  render: ->
    div {
      'data-state': @getType()
      className: 'tags-container'
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
              className: "topic #{@getActiveState('topic')}"
              onClick: => @setPublic true
              }, "Topic Tags"
            a {
              className: "internal #{@getActiveState('internal')}"
              onClick: => @setPublic false
              }, "Internal Tags"
      div { className: 'tags-panel' },
        if @state.public
          div { className: 'tags-topic max-width-container' },
            FilterSearch {
              url: sd.API_URL + "/tags?public=true&q=%QUERY"
              placeholder: 'Search Tags...'
              collection: @props.topicTags
              searchResults: @searchResults
              contentType: 'tag'
            }
        else
          div { className: 'tags-internal max-width-container' },
            FilterSearch {
              url: sd.API_URL + "/tags?public=true&q=%QUERY"
              placeholder: 'Search Tags...'
              collection: @props.internalTags
              searchResults: @searchResults
              contentType: 'tag'
            }

module.exports.init = ->
  props =
    topicTags: sd.TAGS
    public: true
  ReactDOM.render(
    React.createElement(TagsView, props), document.getElementById('tags-root')
  )