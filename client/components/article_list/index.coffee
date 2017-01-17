# Example initialization
# ArticleList {
#   selected: () ->
#   checkable: true
#   articles: []
# }

_ = require 'underscore'
React = require 'react'
{ input, div, a, h1, h2 } = React.DOM
moment = require 'moment'
icons = -> require('./icons.jade') arguments...

module.exports = ArticleList = React.createClass

  publishText: (result) ->
    if result.published_at and result.published
      "Published #{moment(result.published_at).fromNow()}"
    else if result.scheduled_publish_at
      "Scheduled to publish " +
      "#{moment(result.scheduled_publish_at).fromNow()}"
    else
      "Last saved " +
      "#{moment(result.updated_at).fromNow()}"

  noResults: ->
    if !@props.articles?.length
      div { className: 'article-list__no-results' }, "No Results Found"

  render: ->
    div { className: 'article-list__results' },
      @noResults()
      (@props.articles.map (result) =>
        div { className: 'article-list__result paginated-list-item' },
          if @props.checkable
            div {
              className: 'article-list__checkcircle'
              dangerouslySetInnerHTML: __html: $(icons()).filter('.check-circle').html()
              onClick: => @props.selected(result)
            }
          a { className: 'article-list__article', href: "/articles/#{result.id}/edit" },
            div { className: 'article-list__image paginated-list-img', style: backgroundImage: "url(#{result.thumbnail_image})" },
              unless result.thumbnail_image
                div { className: 'missing-img'}, "Missing Thumbnail"
            div { className: 'article-list__title paginated-list-text-container' },
              if result.thumbnail_title
                h1 {}, result.thumbnail_title
              else
                h1 { className: 'missing-title'}, 'Missing Title'
              h2 {}, @publishText(result)
          a { className: 'paginated-list-preview avant-garde-button'
            , href: "#{sd.FORCE_URL}/article/#{result.slug}"
            , target: '_blank' }, "Preview"
      )
