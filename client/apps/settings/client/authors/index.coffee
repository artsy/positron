_ = require 'underscore'
React = require 'react'
ReactDOM = require 'react-dom'
sd = require('sharify').data
request = require 'superagent'
{ div, input, button, img } = React.DOM
AuthorModal = React.createFactory require './author_modal.coffee'
Author = require '../../../../models/author.coffee'

AuthorsView = React.createClass
  displayName: 'AuthorsView'

  getInitialState: ->
    loading: false
    editingAuthor: null
    isModalOpen: false
    authors: @props.authors
    errorMessage: ''

  openModal: (author = null) ->
    @setState
      editingAuthor: author
      isModalOpen: true

  closeModal: ->
    @setState isModalOpen: false

  saveAuthor: (author) ->
    new Author().save author,
      success: =>
        @closeModal()
      error: (model, res) =>
        msg = res?.responseJSON?.message or 'There has been an error. Please contact support.'
        @flashError msg

  flashError: (msg) ->
    @setState errorMessage: msg
    setTimeout ( => @setState(errorMessage: '')), 1000

  render: ->
    div {
      className: 'authors-container'
      'data-loading': @state.loading
    },
      if @state.errorMessage
        div { className: 'flash-error' }, @state.errorMessage
      AuthorModal {
        author: @state.editingAuthor
        isOpen: @state.isModalOpen
        onClose: @closeModal
        onSave: @saveAuthor
      }
      div { className: 'page-header'},
        div { className: 'authors-header max-width-container'},
          div {}, 'Authors'
          button {
            className: 'authors-header__button avant-garde-button'
            onClick: @openModal
          }, 'Add Author'
      div {
        className: 'authors-list max-width-container'
      },
        (@props.authors.map (author) =>
          div {
            className: 'authors-list__item paginated-list-item'
            key: author.id
          },
            img {
              src: author.image_url
              className: 'author-image'
            }
            author.name
            button {
              className: 'authors-list__item-edit avant-garde-button'
              onClick: => @openModal(author)
              key: author.id
            }, 'Edit'
        )

module.exports.init = ->
  props = authors: sd.AUTHORS
  ReactDOM.render(
    React.createElement(AuthorsView, props), document.getElementById('authors-root')
  )