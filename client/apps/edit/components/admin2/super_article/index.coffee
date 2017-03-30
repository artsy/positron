React = require 'react'
ReactDOM = require 'react-dom'
{ div, input, label, textarea, section, h1, h2, span } = React.DOM

ImageUpload = React.createFactory require '../image_upload.coffee'

module.exports = React.createClass
  displayName: 'AdminSuperArticle'

  getInitialState: ->
    is_super_article: false
    super_article:
      partner_link: ''
      partner_logo: ''
      partner_link_title: ''
      partner_logo_link: ''
      partner_fullscreen_header_logo: ''
      secondary_partner_logo: ''
      secondary_logo_text: ''
      secondary_logo_link: ''
      footer_blurb: ''
      related_articles: []

  onInputChange: (e) ->
    newSuperArticle = @state.super_article
    newSuperArticle[e.target.name] = e.target.value
    @setState super_article: newSuperArticle

  onCheckboxChange: (e) ->
    @setState is_super_article: !@state.is_super_article

  upload: (src, field) ->
    newSuperArticle = @state.super_article
    newSuperArticle[field] = src
    @setState super_article: newSuperArticle

  printFieldGroup: (field, title) ->
    div {className: 'field-group'},
      label {}, title
      input {
        value: @state.super_article[field]
        onChange: @onInputChange
        name: field
        className: 'bordered-input'
        disabled: !@state.is_super_article
      }

  render: ->
    div { className: 'edit-admin--super-article edit-admin__fields'},
      div {className: 'fields-full'},
        div {
          className: 'field-group--inline flat-checkbox fields-col-3'
          onClick: @onCheckboxChange
        },
          input {
            type: 'checkbox'
            checked: @state.is_super_article
            ref: 'is_super_article'
          }
          label {}, 'Enable Super Article'

      div {className: 'fields-full'},

        div {className: 'fields-col-3'},
          @printFieldGroup 'partner_link_title', 'Partner Link Title'
          @printFieldGroup 'partner_link', 'Partner Link'
          @printFieldGroup 'partner_logo_link', 'Partner Logo Link'
          @printFieldGroup 'secondary_logo_text', 'Secondary Logo Text'
          @printFieldGroup 'secondary_logo_link', 'Secondary Logo Link'

          div {className: 'field-group'},
            label {}, 'Footer Blurb'
            textarea {
              value: @state.super_article.footer_blurb
              onChange: @onInputChange
              name: 'footer_blurb'
              className: 'bordered-input'
              disabled: !@state.is_super_article
            }

        div {className: 'fields-col-3'},
          div {className: 'field-group'},
            label {}, 'Partner Logo'
            ImageUpload { upload: @upload, name: 'partner_logo', disabled: !@state.is_super_article }

          div {className: 'field-group'},
            label {}, 'Partner Fullscreen'
            ImageUpload { upload: @upload, name: 'partner_fullscreen_header_logo', disabled: !@state.is_super_article }

          div {className: 'field-group'},
            label {}, 'Secondary Logo'
            ImageUpload { upload: @upload, name: 'secondary_partner_logo', disabled: !@state.is_super_article }

        div {className: 'fields-col-3'},
          div {className: 'field-group'},
            label {}, 'SubArticles'
            input {className: 'bordered-input'}
