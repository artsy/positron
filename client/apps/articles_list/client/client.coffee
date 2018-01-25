_ = require 'underscore'
React = require 'react'
ReactDOM = require 'react-dom'
onInfiniteScroll = require 'jquery-on-infinite-scroll'
{ div, nav, a, h1 } = React.DOM
Article = require '../../../models/article.coffee'
Channel = require '../../../models/channel.coffee'
FilterSearch = React.createFactory require '../../../components/filter_search/index.coffee'
query = require '../query.coffee'
sd = require('sharify').data
request = require 'superagent'
icons = -> require('../icons.jade') arguments...

module.exports.ArticlesListView = ArticlesListView = React.createClass
  displayName: 'ArticlesListView'

  getInitialState: ->
    articles: @props.articles or []
    published: @props.published
    offset: 0

  componentDidMount: ->
    canLoadMore = _.debounce @canLoadMore, 300
    $.onInfiniteScroll canLoadMore

  canLoadMore: ->
    return if $('.filter-search__input').val()
    $('.loading-spinner').fadeIn()
    @fetchFeed @state.published, @state.offset + 10, @appendMore

  setResults: (results) ->
    @setState articles: results

  setPublished: (type) ->
    @setState published: type, offset: 0
    @fetchFeed type, 0, @setResults

  appendMore: (results) ->
    articles = @state.articles.concat(results)
    @setState articles: articles
    $('.loading-spinner').fadeOut()

  fetchFeed: (type, offset, cb) ->
    feedQuery = query "published: #{type}, offset: #{offset}, channel_id: \"#{sd.CURRENT_CHANNEL.id}\""
    request
      .post sd.API_URL + '/graphql'
      .set 'X-Access-Token', sd.USER?.access_token
      .send query: feedQuery
      .end (err, res) =>
        return if err or not res.body?.data
        @setState offset: @state.offset + 10
        cb res.body.data.articles

  showEmptyMessage: ->
    div { className: 'article-list__empty'},
      div {}, 'You haven’t written any articles yet.'
      div {}, 'Artsy Writer is a tool for writing stories about art on Artsy.'
      div {}, 'Get started by writing an article or reaching out to your liaison for help.'
      a { className: 'avant-garde-button avant-garde-button-black article-new-button'
          , href: '/articles/new'
          , dangerouslySetInnerHTML: __html: $(icons()).filter('.new-article').html() + 'Write An Article' }

  showArticlesList: ->
    if @props.articles?.length
      div { className: 'articles-list__container' },
        div { className: 'articles-list__title'}, "Latest Articles"
        FilterSearch {
          url: sd.API_URL + "/articles?published=#{@state.published}&channel_id=#{sd.CURRENT_CHANNEL.id}&q=%QUERY"
          placeholder: 'Search Articles...'
          collection: @state.articles
          searchResults: @setResults
          selected: null
          contentType: 'article'
          checkable: false
        }
    else
      @showEmptyMessage()

  render: ->
    div {
      className: 'articles-list'
    },
      h1 { className: 'articles-list__header page-header' },
        div { className: 'max-width-container' },
          nav {className: 'nav-tabs'},
            a {
              className: "#{if @state.published is true then 'is-active' else ''} published"
              onClick: => @setPublished true
              }, "Published"
            a {
              className: "#{if @state.published is false then 'is-active' else ''} drafts"
              onClick: => @setPublished false
              }, "Drafts"
          div {className: 'channel-name'}, "#{@props.channel.get('name')}"
      @showArticlesList()

module.exports.init = ->
  props =
    articles: sd.ARTICLES
    published: sd.HAS_PUBLISHED
    channel: new Channel sd.CURRENT_CHANNEL
  ReactDOM.render React.createElement(ArticlesListView, props), document.getElementById('articles-list')