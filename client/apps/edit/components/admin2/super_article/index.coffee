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
          div {className: 'field-group'},
            label {}, 'Partner Link Title'
            input {
              value: @state.super_article.partner_link_title
              onChange: @onInputChange
              name: 'partner_link_title'
              className: 'bordered-input'
            }

          div {className: 'field-group'},
            label {}, 'Partner Link'
            input {
              value: @state.super_article.partner_link
              onChange: @onInputChange
              name: 'partner_link'
              className: 'bordered-input'
            }

          div {className: 'field-group'},
            label {}, 'Partner Logo Link'
            input {
              value: @state.super_article.partner_logo_link
              onChange: @onInputChange
              name: 'partner_logo_link'
              className: 'bordered-input'
            }

          div {className: 'field-group'},
            label {}, 'Secondary Logo Text'
            input {
              value: @state.super_article.secondary_logo_text
              onChange: @onInputChange
              name: 'secondary_logo_text'
              className: 'bordered-input'
            }

          div {className: 'field-group'},
            label {}, 'Secondary Logo Link'
            input {
              value: @state.super_article.secondary_logo_link
              onChange: @onInputChange
              name: 'secondary_logo_link'
              className: 'bordered-input'
            }

          div {className: 'field-group'},
            label {}, 'Footer Blurb'
            textarea {
              value: @state.super_article.footer_blurb
              onChange: @onInputChange
              name: 'footer_blurb'
              className: 'bordered-input'
            }

        div {className: 'fields-col-3'},
          div {className: 'field-group'},
            label {}, 'Partner Logo'
            ImageUpload { upload: @upload, name: 'partner_logo' }

          div {className: 'field-group'},
            label {}, 'Partner Fullscreen'
            ImageUpload { upload: @upload, name: 'partner_fullscreen_header_logo' }

          div {className: 'field-group'},
            label {}, 'Secondary Logo'
            ImageUpload { upload: @upload, name: 'secondary_partner_logo' }

        div {className: 'fields-col-3'},
          div {className: 'field-group'},
            label {}, 'SubArticles'
            input {className: 'bordered-input'}
