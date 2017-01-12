Backbone = require 'backbone'
_ = require 'underscore'
React = require 'react'
{ div, nav, a, h1 } = React.DOM
Article = require '../../../models/article.coffee'
FilterSearch = require '../../../components/filter_search/index.coffee'
query = require '../query.coffee'
sd = require('sharify').data
request = require 'superagent'

module.exports.SortableListView = SortableListView = React.createClass
  getInitialState: ->
    articles: @props.articles or []
    published: @props.published or true

  searchResults: (results) ->
    @setState articles: results

  setPublished: (type) ->
    @setState published: type
    @fetchFeed type

  fetchFeed: (type) ->
    # published = type in ['daily_email', 'weekly_email']
    feedQuery = query "published: #{type}, channel_id: \"#{sd.CURRENT_CHANNEL.id}\""
    request
      .post sd.API_URL + '/graphql'
      .set 'X-Access-Token', sd.USER?.access_token
      .send query: feedQuery
      .end (err, res) =>
        return if err or not res.body?.data
        @setState articles: res.body.data.articles
        # @fetchLatest()

  render: ->
    div {
      className: 'queue-root-container'
    },
      h1 { className: 'page-header' },
        div { className: 'max-width-container' },
          nav {className: 'queue-tabs'},
            a {
              className: "#{if @state.published is true then 'is-active' else ''} published"
              onClick: => @setPublished true
              }, "Published"
            a {
              className: "#{if @state.published is false then 'is-active' else ''} drafts"
              onClick: => @setPublished false
              }, "Drafts"
      div {},
        div { className: 'queue-filter-search max-width-container' },
          FilterSearch {
            url: sd.API_URL + "/articles?published=#{@state.published}&channel_id=#{sd.CURRENT_CHANNEL.id}&q=%QUERY"
            placeholder: 'Search Articles...'
            articles: @state.articles
            searchResults: @searchResults
          }

module.exports.init = ->
  props =
    articles: sd.SCHEDULED_ARTICLES
  React.render React.createElement(SortableListView, props), document.getElementById('queue-root')
