_ = require 'underscore'
React = require 'react'
ReactDOM = require 'react-dom'
sd = require('sharify').data
request = require 'superagent'
{ div, input, button, img } = React.DOM
AuthorModal = React.createFactory require './author_modal.coffee'

AuthorsView = React.createClass
  displayName: 'AuthorsView'

  getInitialState: ->
    loading: false
    author: null
    isModalOpen: false
    authors: @props.authors

  editAuthor: (e) ->
    @setState
      author: {}
      isModalOpen: true

  addAuthor: ->
    @setState
      author: null
      isModalOpen: true

  onCancel: ->
    @setState isModalOpen: false

  render: ->
    div {
      className: 'authors-container'
      'data-loading': @state.loading
    },
      AuthorModal {
        author: @state.author
        isOpen: @state.isModalOpen
        onCancel: @onCancel
      }
      console.log @state.isModalOpen
      div { className: 'page-header'},
        div { className: 'authors-header max-width-container'},
          div {}, 'Authors'
          button {
            className: 'authors-header__button avant-garde-button'
            onClick: @addAuthor
          }, 'Add Author'
      div {
        className: 'authors-list max-width-container'
      },
        (@props.authors.map (author) =>
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
              className: 'authors-list__item-edit avant-garde-button'
              onClick: @editAuthor
              key: author.id
            }, 'Edit'
        )

module.exports.init = ->
  props = authors: sd.AUTHORS
  ReactDOM.render(
    React.createElement(AuthorsView, props), document.getElementById('authors-root')
  )