_ = require 'underscore'
React = require 'react'
ReactDOM = require 'react-dom'
sd = require('sharify').data
request = require 'superagent'
Tags = require '../../../collections/tags.coffee'
Tag = require '../../../models/tag.coffee'
FilterSearch = React.createFactory require '../../../components/filter_search/index.coffee'
AddTag = React.createFactory require './add_tag.coffee'
query = require './tagsQuery.coffee'
{ div, nav, a, h1, input, button } = React.DOM

module.exports.TagsView = TagsView = React.createClass
  displayName: 'TagsView'

  getInitialState: ->
    tags: @props.tags or []
    public: @props.public or true
    loading: false
    errorMessage: ''

  addTag: (name) ->
    data =
      name: name
      public: @state.public
    new Tag().save data,
      success: (model, res) =>
        @setState tags: @state.tags.concat res
      error: (model, res) =>
        msg = res?.responseJSON?.message or 'There has been an error. Please contact support.'
        @flashError msg

  deleteTag: (tag) ->
    new Tag(id: tag.id).destroy
      success: (model, res) =>
        @setState tags: _.filter @state.tags, (t) -> tag.id isnt t.id
      error: (model, res) =>
        msg = res?.responseJSON?.message or 'There has been an error. Please contact support.'
        @flashError msg

  flashError: (msg) ->
    @setState errorMessage: msg
    setTimeout ( => @setState(errorMessage: '')), 1000

  searchResults: (results) ->
    @setState tags: results

  setView: (isPublic) ->
    tagQuery = query "public: #{isPublic}, limit: 50"
    request
      .post sd.API_URL + '/graphql'
      .set 'X-Access-Token', sd.USER?.access_token
      .send query: tagQuery
      .end (err, res) =>
        return if err or not res.body?.data
        @setState
          tags: res.body.data.tags
          public: isPublic

  getActiveState: (type) ->
    if @state.public is type then 'is-active' else ''

  render: ->
    div {
      className: 'tags-container'
      'data-loading': @state.loading
    },
      if @state.errorMessage
        div { className: 'flash-error' }, @state.errorMessage
      div { className: 'tags-loading-container'},
        div { className: 'loading-spinner' }
      h1 { className: 'page-header' },
        div { className: 'max-width-container' },
          nav {className: 'nav-tabs'},
            a {
              className: "topic #{@getActiveState(true)}"
              ref: 'topicTab'
              onClick: => @setView true
            }, "Topic Tags"
            a {
              className: "internal #{@getActiveState(false)}"
              ref: 'internalTab'
              onClick: => @setView false
            }, "Internal Tags"
      div { className: 'tags-panel' },
        div { className: 'max-width-container' },
          AddTag {
            addTag: @addTag
          }
          FilterSearch {
            url: sd.API_URL + "/tags?public=#{@state.public}&limit=50&q=%QUERY"
            placeholder: 'Search for tag...'
            collection: @state.tags
            searchResults: @searchResults
            contentType: 'tag'
            deleteTag: @deleteTag
          }

module.exports.init = ->
  props =
    tags: sd.TAGS
    public: true
  ReactDOM.render(
    React.createElement(TagsView, props), document.getElementById('tags-root')
  )