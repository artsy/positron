_ = require 'underscore'
React = require 'react'
{ label, input, div, button, a, h1, h2 } = React.DOM
moment = require 'moment'
sd = require('sharify').data
ArticleList = require '../article_list/index.coffee'

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
    if @refs.searchQuery.getDOMNode().value.length
      @engine.get @refs.searchQuery.getDOMNode().value, ([total, count, results]) =>
        @props.searchResults results

  selected: (article) ->
    @props.selected article, 'select'

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
      ArticleList {
        articles: @props.articles
        checkable: @props.checked
        selected: @selected
      }
