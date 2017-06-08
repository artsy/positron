_ = require 'underscore'
React = require 'react'
ReactDOM = require 'react-dom'
{ div, input, button, img, h1, label, textarea } = React.DOM
Modal = require '../../../../components/modal/index.coffee'

module.exports = AuthorModal = class AuthorModal extends Modal
  displayName: 'AuthorModal'

  getInitialState: ->
    author: @props.author

  render: ->
    div {
      className: 'modal'
      'data-open': @props.isOpen
    },
      div {className: 'modal-container__overlay'}
      div {className: 'modal-container'},
        if @state.author
          h1 {}, "Edit #{@state.author.name}"
        else
          h1 {}, 'Add New Author'
        div { className: 'author-edit fields-full'},
          div {className: 'fields-left'},
            div {className: 'field-group'},
              div {className: 'author-edit__image'},
                label {}, 'Profile Upload'
              label {}, 'Name'
              input {
                className: 'bordered-input'
                placeholder: 'Enter name here...'
              }
              label {}, 'Twitter Handle'
              input {
                className: 'bordered-input'
                placeholder: 'Enter Twitter handle here...'
              }
          div {className: 'fields-right'},
            label {}, 'Bio'
            textarea {className: 'author-edit__bio bordered-input'}
        div {className: 'fields-full'},
          button {
            className: 'author-edit__button avant-garde-button avant-garde-button-black fields-left'
            onClick: @props.onSave
          }, 'Save'
          button {
            className: 'author-edit__button avant-garde-button fields-right'
            onClick: @props.onCancel
          }, 'Cancel'