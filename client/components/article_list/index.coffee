# Example initialization
# ArticleList {
#   selected: () ->
#   checkable: true
#   display: 'email'
#   articles: []
# }

window.global = window
_ = require 'underscore'
React = require 'react'
{ input, div, a, h1, h2 } = React.DOM
moment = require 'moment'
icons = -> require('./icons.jade') arguments...

module.exports = React.createClass
  displayName: 'ArticleList'

  getDisplayAttrs: (article) ->
    if @props.display is 'email' and article.email_metadata
      return {headline: article.email_metadata.headline, image: article.email_metadata.image_url}
    else
      return {headline: article.thumbnail_title, image: article.thumbnail_image}

  publishText: (result) ->
    if result.published_at and result.published
      "Published #{moment(result.published_at).fromNow()}"
    else if result.scheduled_publish_at
      "Scheduled to publish " +
      "#{moment(result.scheduled_publish_at).fromNow()}"
    else
      "Last saved " +
      "#{moment(result.updated_at).fromNow()}"

  render: ->
    div { className: 'article-list__results' },
      unless @props.articles?.length
        div { className: 'article-list__no-results' }, "No Results Found"
      (@props.articles.map (result) =>
        attrs = @getDisplayAttrs(result)
        div { className: 'article-list__result paginated-list-item', key: result.id},
          if @props.checkable
            div {
              ref: result.id
              className: 'article-list__checkcircle'
              dangerouslySetInnerHTML: __html: $(icons()).filter('.check-circle').html()
              onClick: => @props.selected(result)
            }
          a { className: 'article-list__article', href: "/articles/#{result.id}/edit" },
            div { className: 'article-list__image paginated-list-img', style: backgroundImage: "url(#{attrs.image})" },
              unless attrs.image
                div { className: 'missing-img'}, "Missing Thumbnail"
            div { className: 'article-list__title paginated-list-text-container' },
              if attrs.headline
                h1 {}, attrs.headline
              else
                h1 { className: 'missing-title'}, 'Missing Title'
              h2 {}, @publishText(result)
          a { className: 'paginated-list-preview avant-garde-button'
            , href: "#{sd.FORCE_URL}/article/#{result.slug}"
            , target: '_blank' }, "Preview"
      )
