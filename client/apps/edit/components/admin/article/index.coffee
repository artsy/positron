React = require 'react'
ReactDOM = require 'react-dom'
_ = require 'underscore'
moment = require 'moment'
sd = require('sharify').data
{ div, label, span, input, button } = React.DOM
AutocompleteList = React.createFactory require '../../../../../components/autocomplete_list/index.coffee'

module.exports = AdminArticle = React.createClass
  displayName: 'AdminArticle'

  getInitialState: ->
    publish_date: moment().local().format('YYYY-MM-DD')
    publish_time: moment().local().format('HH:mm')
    focus_date: false
    tier: @props.article.get('tier') or 2
    featured: @props.article?.get('featured') or false
    layout: @setInitialLayout()
    relatedArticles: @props.article?.get('related_article_ids') or []

  componentWillMount: ->
    @setupPublishDate()

  componentDidMount: ->
    ReactDOM.findDOMNode(@refs.container).classList += ' active'

  setInitialLayout: ->
    return 'classic' unless @props.channel?.type is 'editorial'
    return @props.article?.get('layout') or 'standard'

  onChange: (key, value) ->
    @props.onChange key, value
    @forceUpdate()

  onTierChange: (e) ->
    tier = parseInt e.target.name
    @setState tier: tier
    @onChange 'tier', tier

  onPrimaryAuthorChange: (e) ->
    @onChange 'author', {name: e.target.value, id: @props.article.get('author').id}

  onMagazineChange: (e) ->
    featured = if e.target.name is 'true' then true else false
    @setState featured: featured
    @onChange 'featured', featured

  onLayoutChange: (e) ->
    if e.target.name is 'standard' and @props.article.get('layout') is 'feature'
      canLoseData = confirm 'Some header and section layout data may be lost. Change anyways?'
      return false unless canLoseData
    @setState layout: e.target.name
    @onChange 'layout', e.target.name

  onCheckboxChange: (e) ->
    key = $(e.currentTarget).attr('name')
    @onChange key, !@props.article.get key

  onPublishDateChange: (e) ->
    @setState
      publish_date: @refs.publish_date.value
      publish_time: @refs.publish_time.value

  setupPublishDate: ->
    if @props.article.get 'scheduled_publish_at'
      @setState
        publish_date: @props.article.date('scheduled_publish_at').format('YYYY-MM-DD')
        publish_time: @props.article.date('scheduled_publish_at').format('HH:mm')
    else if @props.article.get 'published_at'
      @setState
        publish_date: @props.article.date('published_at').format('YYYY-MM-DD')
        publish_time: @props.article.date('published_at').format('HH:mm')
    else
      @setState
        publish_date: moment().local().format('YYYY-MM-DD')
        publish_time: moment().local().format('HH:mm')

  publishButtonText: ->
    buttonText = 'Schedule'
    if @props.article.get 'published'
      buttonText = 'Update'
    else if @props.article.get 'scheduled_publish_at'
      buttonText = 'Unschedule'
    return buttonText

  onScheduleChange: ->
    published_at = moment(@refs.publish_date.value + ' ' + @refs.publish_time.value).local()
    unless @props.article.get 'published'
      @onChange 'published_at', null
      if @props.article.get 'scheduled_publish_at'
        # if draft and has scheduled date, unschedule
        @onChange 'scheduled_publish_at', null
      else
        # if draft and no scheduled date, set scheduled
        @onChange 'scheduled_publish_at', published_at.toISOString()
    else
      # if article is published, reset published date
      @onChange 'published_at', published_at.toISOString()

  focusDate: (e) ->
    @setState focus_date: true

  blurDate: (e) ->
    @setState focus_date: false

  showActive: (key, value) ->
    active = if @state[key] is value then ' active' else ''

  render: ->
    isEditorial = @props.channel.type is 'editorial'

    div { className: 'edit-admin--article edit-admin__fields', ref: 'container'},

      div {className: 'fields-full'},
        div {className: 'fields-left'},
          div {className: 'field-group'},
            label {}, 'Primary Author'
            input {
              className: 'bordered-input'
              placeholder: 'Change Primary Author name'
              defaultValue: @props.article.get('author')?.name || ''
              onChange: @onPrimaryAuthorChange
            }
        div {className: 'fields-right'},
          div {className: 'field-group'},
            label {},
              'Contributing Author'
              if isEditorial
                span {},
                  '* will be deprecated'
            AutocompleteList {
              url: "#{sd.ARTSY_URL}/api/v1/match/users?term=%QUERY"
              placeholder: 'Search by user name or email...'
              draggable: true
              filter: (users) -> for user in users
                { id: { id: user.id, name: user.name }, value: _.compact([user.name, user.email]).join(', ') }
              selected: (e, item, items) =>
                @onChange 'contributing_authors', _.pluck items, 'id'
              removed: (e, item, items) =>
                @onChange 'contributing_authors', _.without(_.pluck(items, 'id'),item.id)
              idsToFetch: @props.article.get('contributing_authors') || []
              fetchUrl: (id) -> "#{sd.ARTSY_URL}/api/v1/user/#{id.id}"
              resObject: (res) ->
                id: { id: res.body.id , name: res.body.name },
                value: _.compact([res.body.name, res.body.email]).join(', ')
            }
          div {className: 'field-group'},
            label {}, 'Authors'
            AutocompleteList {
              url: "#{sd.API_URL}/authors?q=%QUERY"
              placeholder: 'Search by author name...'
              draggable: true
              filter: (authors) -> for author in authors.results
                id: { id: author.id, name: author.name }
                value: author.name
              selected: (e, item, items) =>
                selectedAuthors = _.pluck(items, 'id')
                authorIds = _.map(selectedAuthors, 'id')
                @onChange 'author_ids', authorIds
              removed: (e, item, items) =>
                @onChange 'author_ids', _.without(_.pluck(items, 'id'),item.id)
              idsToFetch: @props.article.get('author_ids') || []
              fetchUrl: (id) -> "#{sd.API_URL}/authors/#{id}"
              resObject: (res) ->
                id: { id: res.body.id, name: res.body.name }
                value: res.body.name
            }


      div {className: 'fields-full'},
        div {className: 'fields-left'},
          div {className: 'field-group--inline tier-feed'},
            div {className: 'field-group'},
              label {}, 'Article Tier'
              div {className: 'button-group'},
                button {
                  className: 'avant-garde-button' + @showActive('tier', 1)
                  onClick: @onTierChange
                  name: '1'
                }, 'Tier 1'
                button {
                  className: 'avant-garde-button' + @showActive('tier', 2)
                  onClick: @onTierChange
                  name: '2'
                }, 'Tier 2'
            div {className: 'field-group'},
              label {}, 'Magazine Feed'
              div {className: 'button-group'},
                button {
                  className: 'avant-garde-button' + @showActive 'featured', true
                  onClick: @onMagazineChange
                  name: 'true'
                }, 'Yes'
                button {
                  className: 'avant-garde-button' + @showActive 'featured', false
                  onClick: @onMagazineChange
                }, 'No'

          if isEditorial
            div {className: 'field-group article-layout'},
              label {}, 'Article Layout'
              div {className: 'button-group'},
                button {
                  className: 'avant-garde-button' + @showActive('layout', 'standard')
                  onClick: @onLayoutChange
                  name: 'standard'
                }, 'Standard'
                button {
                  className: 'avant-garde-button' + @showActive('layout', 'feature')
                  onClick: @onLayoutChange
                  name: 'feature'
                }, 'Feature'

          div {
            className: 'field-group--inline flat-checkbox'
            onClick: @onCheckboxChange
            name: 'indexable'
          },
            input {
              type: 'checkbox'
              checked: @props.article.get 'indexable'
              value: @props.article.get 'indexable'
              readOnly: true
            }
            label {}, 'Index for Search'
          div {
            className: 'field-group--inline flat-checkbox'
            onClick: @onCheckboxChange
            name: 'exclude_google_news'
          },
            input {
              type: 'checkbox'
              checked: @props.article.get 'exclude_google_news'
              value: @props.article.get 'exclude_google_news'
              readOnly: true
            }
            label {}, 'Exclude from Google News'

        div {className: 'fields-right'},
          div {className: 'field-group publish-time'},
            label {}, 'Publish Time'
            div {className: 'field-group--inline'},
              input {
                type: 'date'
                className: 'bordered-input edit-admin-input-date' + @showActive 'focus_date', true
                ref: 'publish_date'
                onChange: @onPublishDateChange
                defaultValue: @state.publish_date
                onClick: @focusDate
                onBlur: @blurDate
              }
              input {
                type: 'time'
                className: 'bordered-input edit-admin-input-date' + @showActive 'focus_date', true
                ref: 'publish_time'
                onChange: @onPublishDateChange
                value: @state.publish_time
                onClick: @focusDate
                onBlur: @blurDate
              }
              button {
                className: 'avant-garde-button date'
                onClick: @onScheduleChange
              }, @publishButtonText()

          if isEditorial
            div {className: 'field-group'},
              label {}, 'Related Articles'
              AutocompleteList {
                url: "#{sd.API_URL}/articles?published=true&q=%QUERY"
                placeholder: "Search articles by title..."
                filter: (articles) ->
                  for article in articles.results
                    { id: article.id, value: "#{article.title}, #{article.author?.name}"}
                selected: (e, item, items) =>
                  relatedArticles = @state.relatedArticles
                  relatedArticles = _.pluck items, 'id'
                  @setState relatedArticles: relatedArticles
                  @props.onChange 'related_article_ids', relatedArticles
                removed: (e, item, items) =>
                  relatedArticles = @state.relatedArticles
                  relatedArticles = _.without(_.pluck(items,'id'),item.id)
                  @setState relatedArticles: relatedArticles
                  @props.onChange 'related_article_ids', relatedArticles
                idsToFetch: @props.article.get('related_article_ids')
                fetchUrl: (id) -> "#{sd.API_URL}/articles/#{id}"
                resObject: (res) ->
                  id: res.body.id, value: "#{res.body.title}, #{res.body.author?.name}"
              }
