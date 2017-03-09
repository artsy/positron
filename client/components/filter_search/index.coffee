_ = require 'underscore'
React = require 'react'
{ label, input, div, button, a, h1, h2 } = React.DOM
moment = require 'moment'
sd = require('sharify').data
ArticleList = React.createFactory require '../article_list/index.coffee'

module.exports = React.createClass
  displayName: 'FilterSearch'

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
    if @refs.searchQuery.value.length
      if @engine.remote.url != @props.url then @engine.remote.url = @props.url
      @engine.get @refs.searchQuery.value, ([results]) =>
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
        checkable: @props.checkable
        selected: @selected
        display: @props.display
      }
