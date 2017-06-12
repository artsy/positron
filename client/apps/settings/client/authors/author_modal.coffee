_ = require 'underscore'
React = require 'react'
ReactDOM = require 'react-dom'
{ div, input, button, img, h1, label, textarea, a } = React.DOM
icons = -> require('../../templates/authors/authors_icons.jade') arguments...

module.exports = AuthorModal = React.createClass
  displayName: 'AuthorModal'

  getInitialState: ->
    author: @props.author or {}
    remainingChars: 200

  componentWillReceiveProps: (nextProps) ->
    @setState author: nextProps.author

  onBioChange: (e) ->
    @setState remainingChars: 200 - e.target.value.length

  onInputChange: (e) ->
    author = _.extend @state.author, "#{e.target.name}": e.target.value
    @setState author: author

  render: ->
    div {
      className: 'modal'
      'data-open': @props.isOpen
    },
      div {className: 'modal-container__overlay'}
      div {className: 'modal-container'},
        div {
          className: 'author-edit__close'
          onClick: @props.onClose
        }
        if @state.author
          h1 {}, "Edit #{@state.author.name}"
        else
          h1 {}, 'Add New Author'
        div {className: 'author-edit fields-full admin-form-container'},
          div {className: 'fields-left'},
            div {className: 'field-group'},
              label {}, 'Profile Photo'
              div { className: 'author-edit__image'},
                if @state.author?.image_url
                  img {src: @state.author?.image_url}
                else
                  div {
                    className: 'author-edit__image-missing'
                    dangerouslySetInnerHTML: __html:
                      $(icons()).filter('.profile-icon').html()
                  }
                div {
                  className: 'author-edit__change-image'
                  onClick: @onUploadImage
                }, 'Click to ' +
                  if @state.author?.image_url then 'Replace' else 'Upload'
            div {className: 'field-group'},
              label {}, 'Name'
              input {
                className: 'bordered-input'
                placeholder: 'Enter name here...'
                value: @state.author.name or ''
                name: 'name'
                onChange: @onInputChange
              }
            div {className: 'field-group'},
              label {}, 'Twitter Handle'
              div {
                className: 'author-edit__twitter-at'
              }, '@'
              input {
                className: 'bordered-input author-edit__twitter'
                placeholder: 'Enter Twitter handle here...'
                value: @state.author.twitter_handle or ''
                name: 'twitter_handle'
                onChange: @onInputChange
              }
          div {className: 'fields-right'},
            label {}, 'Bio'
            textarea {
              className: 'author-edit__bio bordered-input'
              placeholder: 'Write brief biography...'
              onChange: @onBioChange
              maxLength: 200
              value: @state.author.bio or ''
            }
            div {className: 'author-edit__bio-footer'},
              div {className: 'author-edit__markdown'}, '* Supports Markdown'
              div {className: 'author-edit__chars'}, @state.remainingChars.toString() + '/200'
        div {className: 'fields-full'},
          button {
            className: 'author-edit__button avant-garde-button avant-garde-button-black fields-left'
            onClick: => @props.onSave @state.author
          }, 'Save'
          button {
            className: 'author-edit__button avant-garde-button fields-right'
            onClick: @props.onClose
          }, 'Cancel'