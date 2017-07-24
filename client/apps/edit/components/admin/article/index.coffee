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
    publish_date: moment().local().format('YYYY-MM-DD')
    publish_time: moment().local().format('HH:mm')
    focus_date: false
    tier: @props.article.get('tier') or 2
    featured: @props.article?.get('featured') or false

  componentWillMount: ->
    @setupPublishDate()

  componentDidMount: ->
    ReactDOM.findDOMNode(@refs.container).classList += ' active'

  onChange: (key, value)->
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
    if !@props.article.get 'published'
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
