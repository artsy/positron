Backbone = require 'backbone'
_ = require 'underscore'
Q = require 'bluebird-q'
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
    offset: 10

  componentDidMount: ->
    $(window).scroll () =>
      if @state.articles.length >= 10
        last = $('.article-list__result')[_this.state.offset - 1]
        if $(window).scrollTop() >= $(last).position().top - $(window).height()
          # console.log 'fetching, offset=' + @state.offset
          _.once( @fetchFeed @state.published, @loadMore )

  setResults: (results) ->
    @setState articles: results

  setPublished: (type) ->
    @setState published: type
    @fetchFeed type, @setResults

  loadMore: (results) ->
    articles = this.state.articles.concat(results)
    @setState articles: articles, offset: articles.length

  fetchFeed: (type, cb) ->
    feedQuery = query "published: #{type}, offset: #{@state.offset}, channel_id: \"#{sd.CURRENT_CHANNEL.id}\""
    request
      .post sd.API_URL + '/graphql'
      .set 'X-Access-Token', sd.USER?.access_token
      .send query: feedQuery
      .end (err, res) =>
        return if err or not res.body?.data
        cb res.body.data.articles

  render: ->
    div {
      className: 'articles-list'
    },
      h1 { className: 'articles-list__header page-header' },
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
      div { className: 'articles-list__container max-width-container' },
        FilterSearch {
          url: sd.API_URL + "/articles?published=#{@state.published}&channel_id=#{sd.CURRENT_CHANNEL.id}&q=%QUERY"
          placeholder: 'Search Articles...'
          articles: @state.articles
          searchResults: @setResults
          selected: null
        }

module.exports.init = ->
  props =
    articles: sd.SCHEDULED_ARTICLES
  React.render React.createElement(SortableListView, props), document.getElementById('articles-list')
