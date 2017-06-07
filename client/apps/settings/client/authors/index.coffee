_ = require 'underscore'
React = require 'react'
ReactDOM = require 'react-dom'
sd = require('sharify').data
request = require 'superagent'
{ div, nav, a, h1, input, button } = React.DOM

AuthorsView = React.createClass
  displayName: 'AuthorsView'

  getInitialState: ->
    loading: false

  render: ->
    div {
      className: 'authors-container'
      'data-loading': @state.loading
    },
      @props.authors.map (author) ->
        div {
          className: 'authors-list__item'
        }, author.name

module.exports.init = ->
  props =
    authors: sd.AUTHORS
  ReactDOM.render(
    React.createElement(AuthorsView, props), document.getElementById('authors-root')
  )