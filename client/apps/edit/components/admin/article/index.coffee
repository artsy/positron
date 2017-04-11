React = require 'react'
ReactDOM = require 'react-dom'
_ = require 'underscore'
moment = require 'moment'
sd = require('sharify').data
{ div, label, input, button } = React.DOM
AutocompleteList = React.createFactory require '../../../../../components/autocomplete_list/index.coffee'

module.exports = AdminArticle = React.createClass
  displayName: 'AdminArticle'

  getInitialState: ->
    publish_date: moment().format('YYYY-MM-DD')
    publish_time: moment().format('HH:mm')
    focus_date: false

  componentWillMount: ->
    @setupPublishDate()

  componentDidMount: ->
    ReactDOM.findDOMNode(@refs.container).classList += ' active'

  onChange: (key, value)->
    @props.onChange key, value
    @forceUpdate()

  onTierChange: (e) ->
    tier = parseInt e.target.name
    @onChange 'tier', tier

  onPrimaryAuthorChange: (e) ->
    @onChange 'author', {name: e.target.value, id: @props.article.get('author').id}

  onMagazineChange: (e) ->
    featured = if e.target.name is 'true' then true else false
    @onChange 'featured', featured

  onCheckboxChange: (e) ->
    @onChange 'exclude_google_news', !@props.article.get 'exclude_google_news'

  onPublishDateChange: (e) ->
    @setState
      publish_date: @refs.publish_date.value
      publish_time: @refs.publish_time.value
    published_at = moment(@refs.publish_date.value + ' ' + @refs.publish_time.value)
    if !@props.article.get 'published'
      # ignore if draft and date is past
      if published_at < moment()
        @onChange 'published_at', null
      # if draft and date is future, set scheduled
      else
        @onChange 'scheduled_publish_at', published_at.toISOString()
    else
      # if article is published, reset published date
      @onChange 'published_at', published_at.toISOString()

  setupPublishDate: ->
    if @props.article.get 'scheduled_publish_at'
      @setState
        publish_date: moment(@props.article.get('scheduled_publish_at')).format('YYYY-MM-DD')
        publish_time: moment(@props.article.get('scheduled_publish_at')).format('HH:mm')
    if @props.article.get 'published_at'
      @setState
        publish_date: moment(@props.article.get('published_at')).format('YYYY-MM-DD')
        publish_time: moment(@props.article.get('published_at')).format('HH:mm')
    else
      @setState
        publish_date: moment().format('YYYY-MM-DD')
        publish_time: moment().format('HH:mm')

  focusDate: (e) ->
    @setState focus_date: true

  blurDate: (e) ->
    @setState focus_date: false

  showActive: (key, value) ->
    active = if @props.article.get(key) is value then ' active' else ''

  render: ->
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
            label {}, 'Contributing Author'
            AutocompleteList {
              url: "#{sd.ARTSY_URL}/api/v1/match/users?term=%QUERY"
              placeholder: 'Search by user name or email...'
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
            div {
              className: 'field-group--inline flat-checkbox'
              onClick: @onCheckboxChange
            },
              input {
                type: 'checkbox'
                checked: @props.article.get 'exclude_google_news'
              }
              label {}, 'Exclude from Google News'

