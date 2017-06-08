_ = require 'underscore'
React = require 'react'
ReactDOM = require 'react-dom'
sd = require('sharify').data
request = require 'superagent'
{ div, nav, a, h1, input, button, img } = React.DOM

AuthorsView = React.createClass
  displayName: 'AuthorsView'

  getInitialState: ->
    loading: false
    author: {}

  editAuthor: (e) ->
    console.log e
    console.log 'here'

  addAuthor: ->
    console.log 'adding an author'

  render: ->
    div {
      className: 'authors-container'
      'data-loading': @state.loading
    },
      div { className: 'page-header'},
        div { className: 'authors-header max-width-container'},
          div {}, "Authors"
          button {
            className: 'authors-header__button'
            onClick: @addAuthor
          }, "Add Author"
      div {
        className: 'authors-list max-width-container'
      },
        (@props.authors.map (author) ->
          div {
            className: 'authors-list__item'
            key: author.id
          },
            img {
              src: author.img_url
              className: 'authors-list__item-image'
            }
            author.name
            button {
              className: 'authors-list__item-edit'
              onClick: @editAuthor
            }, "Edit"
        )

module.exports.init = ->
  props =
    authors: sd.AUTHORS
  ReactDOM.render(
    React.createElement(AuthorsView, props), document.getElementById('authors-root')
  )