_ = require 'underscore'
React = require 'react'
{ input, div, a, h1, h2 } = React.DOM
moment = require 'moment'
icons = -> require('../../../components/filter_search/icons.jade') arguments...

module.exports = (el, props) ->
  React.render React.createElement(QueuedArticles, props), el

module.exports.QueuedArticles = QueuedArticles = React.createClass

  getInitialState: ->
    articles: @props.articles or []

  render: ->
    div { className: 'filter-search__container' },
      div { className: 'filter-search__header-container' },
        div { className: 'filter-search__header-text' }, @props.headerText
      div {
        className: 'filter-search__results'
      },
        (@state.articles.map (result) =>
          div { className: 'filter-search__result paginated-list-item' },
            div {
              className: 'filter-search__checkcircle'
              dangerouslySetInnerHTML: __html: $(icons()).filter('.check-circle').html()
              onClick: @props.unselected
              }
            div { className: 'filter-search__article' },
              div { className: 'filter-search__image paginated-list-img', style: backgroundImage: "url(#{result.thumbnail_image})" }
              div { className: 'filter-search__title paginated-list-text-container' },
                h1 {}, result.thumbnail_title
                h2 {}, "Published #{moment(result.published_at).fromNow()}"
            a { className: 'paginated-list-preview avant-garde-button', href: "#{sd.FORCE_URL}/article/#{result.slug}", target: '_blank' }, "Preview"
        )
