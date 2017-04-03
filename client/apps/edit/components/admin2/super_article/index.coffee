React = require 'react'
ReactDOM = require 'react-dom'
async = require 'async'
request = require 'superagent'
sd = require('sharify').data
_ = require 'underscore'
{ div, input, label, textarea, section, h1, h2, span } = React.DOM

ImageUpload = React.createFactory require '../image_upload.coffee'
AutocompleteList = require '../../../../../components/autocomplete_list/index.coffee'

module.exports = React.createClass
  displayName: 'AdminSuperArticle'

  getInitialState: ->
    is_super_article: false
    super_article: @props.article.get('super_article') || {}

  componentDidMount: ->
    @setupSuperArticleAutocomplete()
    $(this.refs.autocomplete).find('input.tt-input').prop('disabled', !@state.is_super_article)

  componentWillUnmount: ->
    @props.article.save()
    $(@refs['autocomplete']).each (i, ref) ->
      ReactDOM.unmountComponentAtNode(ref)

  onInputChange: (e) ->
    newSuperArticle = @state.super_article
    newSuperArticle[e.target.name] = e.target.value
    @setState super_article: newSuperArticle
    @props.onChange 'super_article', newSuperArticle

  onCheckboxChange: (e) ->
    @setState is_super_article: !@state.is_super_article
    $(this.refs.autocomplete).find('input.tt-input').prop('disabled', @state.is_super_article)
    @props.onChange 'is_super_article', !@state.is_super_article

  upload: (src, field) ->
    newSuperArticle = @state.super_article
    newSuperArticle[field] = src
    @setState super_article: newSuperArticle
    @props.onChange super_article: newSuperArticle

  setupSuperArticleAutocomplete: ->
    console.log 'in here'
    return unless @props.channel.hasFeature 'superArticle'
    @related_articles = if @props.article.get('super_article')?.related_articles then @props.article.get('super_article').related_articles else []
    list = new AutocompleteList $(@refs['autocomplete'])[0],
      name: 'related_articles[]'
      url: "#{sd.API_URL}/articles?published=true&q=%QUERY"
      placeholder: 'Search article by title...'
      filter: (articles) ->
        for article in articles.results
          { id: article.id, value: "#{article.title}, #{article.author?.name}"} unless article.is_super_article
      selected: (e, item, items) =>
        superArticle = @state.super_article
        superArticle.related_articles = _.pluck items, 'id'
        @setState super_article: superArticle
        @props.onChange 'super_article', superArticle
      removed: (e, item, items) =>
        superArticle = @state.super_article
        superArticle.related_articles = _.without(_.pluck(items,'id'),item.id)
        @setState super_article: superArticle
        @props.onChange 'super_article', superArticle
    if ids = @related_articles
      @articles = []
      async.each ids, (id, cb) =>
        request
          .get("#{sd.API_URL}/articles/#{id}")
          .set('X-Access-Token': sd.USER.access_token).end (err, res) =>
            @articles.push id: res.body.id, value: "#{res.body.title}, #{res.body.author?.name}"
            cb()
      , =>
        list?.setState loading: false, items: @articles
    else
      list?.setState loading: false

  printFieldGroup: (field, title) ->
    div {className: 'field-group'},
      label {}, title
      input {
        value: @state.super_article[field]
        onChange: @onInputChange
        name: field
        ref: field
        className: 'bordered-input'
        disabled: !@state.is_super_article
      }

  printUploadGroup: (field, title) ->
    div {className: 'field-group'},
      label {}, title
      ImageUpload {
        name: field
        src: @state.super_article[field]
        onChange: @upload
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
          @printUploadGroup 'partner_logo', 'Partner Logo'
          @printUploadGroup 'partner_fullscreen_header_logo', 'Partner Fullscreen'
          @printUploadGroup 'secondary_partner_logo', 'Secondary Logo'

        div {className: 'fields-col-3'},
          div {className: 'field-group'},
            label {}, 'SubArticles'
            div { ref: 'autocomplete' }
