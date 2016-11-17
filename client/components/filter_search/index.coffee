_ = require 'underscore'
React = require 'react'
{ label, input, div, button, a, h1, h2 } = React.DOM
moment = require 'moment'
icons = -> require('./icons.jade') arguments...

module.exports = (el, props) ->
  React.render React.createElement(FilterSearch, props), el

module.exports.FilterSearch = FilterSearch = React.createClass

  getInitialState: ->
    loading: false, value: null, articles: @props.articles or []

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
    @props.templates ?= {}
    @props.templates?.empty ?= -> """
      <div class='filter-search__empty'>No results</div>
    """

  search: ->
    @engine.get @refs.searchQuery.getDOMNode().value, ([total, count, results]) =>
      @setState articles: results

  render: ->
    div { className: 'filter-search__container' },
      div { className: 'filter-search__header-container' },
        div { className: 'filter-search__header-text' }, @props.headerText
        input {
          ref: 'input'
          className: 'filter-search__input bordered-input'
          placeholder: @props.placeholder
          onKeyUp: @search
          ref: 'searchQuery'
        }
      div {
        className: 'filter-search__results'
      },
        (@state.articles.map (result) =>
          div { className: 'filter-search__result paginated-list-item' },
            if @props.checkable
              div {
                className: 'filter-search__checkcircle'
                dangerouslySetInnerHTML: __html: $(icons()).filter('.check-circle').html()
                }
            div { className: 'filter-search__article' },
              div { className: 'filter-search__image paginated-list-img', style: backgroundImage: "url(#{result.thumbnail_image})" }
              div { className: 'filter-search__title paginated-list-text-container' },
                h1 {}, result.thumbnail_title
                h2 {}, "Published #{moment(result.published_at).fromNow()}"
            a { className: 'paginated-list-preview avant-garde-button', href: "#{sd.FORCE_URL}/article/#{result.slug}", target: '_blank' }, "Preview"
        )
