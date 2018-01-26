_ = require 'underscore'
React = require 'react'
ReactDOM = require 'react-dom'
{ div } = React.DOM
ArticleList = React.createFactory require '../../../components/article_list'

module.exports = QueuedArticles = React.createClass
  displayName: 'QueuedArticles'

  selected: (article) ->
    @props.selected article, 'unselect'

  render: ->
    div { className: 'queued-articles__container' },
      div { className: 'queued-articles__header-container' },
        div { className: 'queued-articles__header-text' }, @props.headerText
      ArticleList {
        articles: @props.articles
        checkable: true
        selected: @props.selected
      }
