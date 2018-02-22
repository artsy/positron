_ = require 'underscore'
React = require 'react'
{ label, input, div, button, a, h1, h2 } = React.DOM
moment = require 'moment'
sd = require('sharify').data
ArticleList = React.createFactory require('../article_list/').ArticleList
TagList = React.createFactory require '../tag_list/index.coffee'

module.exports = React.createClass
  displayName: 'FilterSearch'

  getInitialState: ->
    value: ''

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

  onChange: (e) ->
    @setState value: e.target.value
    @search e.target.value

  search: (value) ->
    if @engine.remote.url isnt @props.url then @engine.remote.url = @props.url
    @engine.get value, ([results]) =>
      @props.searchResults results

  selected: (article) ->
    @props.selected article, 'select'

  render: ->
    div {
      className: 'filter-search__container'
      'data-type': @props.contentType
    },
      div { className: 'filter-search__header-container' },
        div { className: 'filter-search__header-text' }, @props.headerText
        input {
          className: 'filter-search__input bordered-input'
          placeholder: @props.placeholder
          onChange: @onChange
          value: @state.value
        }
      if @props.contentType is 'article'
        ArticleList {
          articles: @props.collection
          checkable: @props.checkable
          selected: @selected
          display: @props.display
        }
      else if @props.contentType is 'tag'
        TagList {
          tags: @props.collection
          deleteTag: @props.deleteTag
        }
