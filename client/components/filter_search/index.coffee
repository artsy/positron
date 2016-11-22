_ = require 'underscore'
React = require 'react'
{ label, input, div, button, a, h1, h2 } = React.DOM
moment = require 'moment'
icons = -> require('./icons.jade') arguments...
sd = require('sharify').data

module.exports = FilterSearch = React.createClass

  componentDidMount: ->
    @addAutocomplete()

  addAutocomplete: ->
    @engine = new Bloodhound
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value')
      queryTokenizer: Bloodhound.tokenizers.whitespace
      remote:
        url: @props.url
        filter: @props.filter
    @engine.initialize()

  search: ->
    @engine.get @refs.searchQuery.getDOMNode().value, ([total, count, results]) =>
      @props.searchResults results

  render: ->
    div { className: 'filter-search__container' },
      div { className: 'filter-search__header-container' },
        div { className: 'filter-search__header-text' }, @props.headerText
        input {
          className: 'filter-search__input bordered-input'
          placeholder: @props.placeholder
          onKeyUp: @search
          ref: 'searchQuery'
        }
      div {
        className: 'filter-search__results'
      },
        (@props.articles.map (result) =>
          div { className: 'filter-search__result paginated-list-item' },
            if @props.checkable
              div {
                className: 'filter-search__checkcircle'
                dangerouslySetInnerHTML: __html: $(icons()).filter('.check-circle').html()
<<<<<<< HEAD
                onClick: => @props.selected(result)
=======
                onClick: => @selected(result.id)
>>>>>>> d4633a9... Work towards updating state
              }
            div { className: 'filter-search__article' },
              div { className: 'filter-search__image paginated-list-img', style: backgroundImage: "url(#{result.thumbnail_image})" }
              div { className: 'filter-search__title paginated-list-text-container' },
                h1 {}, result.thumbnail_title
                h2 {}, "Published #{moment(result.published_at).fromNow()}"
            a { className: 'paginated-list-preview avant-garde-button', href: "#{sd.FORCE_URL}/article/#{result.slug}", target: '_blank' }, "Preview"
        )
