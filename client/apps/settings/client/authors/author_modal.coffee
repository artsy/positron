_ = require 'underscore'
React = require 'react'
ReactDOM = require 'react-dom'
{ div, input, button, img, h1, label, textarea, a } = React.DOM
icons = -> require('../../templates/authors/authors_icons.jade') arguments...
AuthorImage = React.createFactory require './author_image.coffee'

module.exports = AuthorModal = React.createClass
  displayName: 'AuthorModal'

  getInitialState: ->
    author: @props.author
    remainingChars: 200

  componentWillReceiveProps: (nextProps) ->
    @setState author: nextProps.author

  onBioChange: (e) ->
    author = _.extend {}, @state.author, bio: e.target.value
    @setState
      remainingChars: 200 - e.target.value.length
      author: author

  onInputChange: (e) ->
    author = _.extend {}, @state.author, "#{e.target.name}": e.target.value
    @setState author: author

  onImageChange: (src) ->
    author = _.extend {}, @state.author, image_url: src
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
          dangerouslySetInnerHTML: __html:
            $(icons()).filter('.close').html()
        }
        if @state.author
          h1 {}, "Edit #{@state.author.name}"
        else
          h1 {}, 'Add New Author'
        div {className: 'author-edit fields-full admin-form-container'},
          div {className: 'fields-left'},
            console.log @state.author
            AuthorImage {
              onChange: @onImageChange
              src: @state.author?.image_url
            }
            div {className: 'field-group'},
              label {}, 'Name'
              input {
                className: 'bordered-input'
                placeholder: 'Enter name here...'
                value: @state.author?.name or ''
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
                value: @state.author?.twitter_handle or ''
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
              value: @state.author?.bio or ''
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