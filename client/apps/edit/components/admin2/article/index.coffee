React = require 'react'
ReactDOM = require 'react-dom'
_ = require 'underscore'
moment = require 'moment'
async = require 'async'
request = require 'superagent'
sd = require('sharify').data
{ div, label, input, button } = React.DOM

Autocomplete = require '../../../../../components/autocomplete/index.coffee'
AutocompleteList = require '../../../../../components/autocomplete_list/index.coffee'

module.exports = React.createClass
  displayName: 'AdminArticle'

  getInitialState: ->
    author: @props.article.get('author').name || ''
    contributing_authors: @props.article.get 'contributing_authors' or []
    tier: @props.article.get('tier') || 1
    featured: @props.article.get('featured') || true
    exclude_google_news: @props.article.get('exclude_google_news') || false
    publish_date: moment().format('YYYY-MM-DD')
    publish_time: moment().format('HH:mm')
    scheduled_publish_at: @props.article.get('scheduled_publish_at') || null
    focus_date: false
    is_scheduled: false

  componentWillMount: ->
    @setupPublishDate()

  componentDidMount: ->
    @setupAutocomplete()

  onTierChange: (e) ->
    @setState tier: parseInt(e.target.name)

  showActiveTier: (tier) ->
    active = if @state.tier is tier then ' active' else ''

  onMagazineChange: (e) ->
    featured = if e.target.name is 'true' then true else false
    @setState featured: featured

  showMagazineActive: (status) ->
    active = if @state.featured is status then ' active' else ''

  onCheckboxChange: (e) ->
    @setState exclude_google_news: !@state.exclude_google_news
    @props.article.set('exclude_google_news', !@state.exclude_google_news)

  setupPublishDate: ->
    if @props.article.get('scheduled_publish_at')
      @setState
        publish_date: moment(@props.article.get('scheduled_publish_at')).format('YYYY-MM-DD')
        publish_time: moment(@props.article.get('scheduled_publish_at')).format('HH:mm')
        is_scheduled: true
    if @props.article.get('published_at')
      @setState
        publish_date: moment(@props.article.get('published_at')).format('YYYY-MM-DD')
        publish_time: moment(@props.article.get('published_at')).format('HH:mm')
    else
      @setState
        publish_date: moment().format('YYYY-MM-DD')
        publish_time: moment().format('HH:mm')

  onPublishDateChange: (e) ->
    @setState
      publish_date: @refs.publish_date.value
      publish_time: @refs.publish_time.value

  onPublishSchedule: (e) ->
    publish_date = moment(@state.publish_date + ' ' + @state.publish_time).toISOString()
    @setState scheduled_publish_at: publish_date, is_scheduled: true

  onPublishUnschedule: ->
    @setState scheduled_publish_at: null, is_scheduled: false

  focusDate: (e) ->
    @setState focus_date: true

  blurDate: (e) ->
    @setState focus_date: false

  setupAutocomplete: ->
    list = new AutocompleteList $(@refs.autocomplete)[0],
      name: 'contributing_authors[]'
      url: "#{sd.ARTSY_URL}/api/v1/match/users?term=%QUERY"
      placeholder: 'Search by user name or email...'
      filter: (users) -> for user in users
        { id: { id: user.id, name: user.name }, value: _.compact([user.name, user.email]).join(', ') }
      selected: (e, item, items) =>
        @setState contributing_authors: _.pluck items, 'id'
      removed: (e, item, items) =>
        @setState contributing_authors: _.without(_.pluck(items, 'id'),item.id)
    if @props.article.get('contributing_authors')?.length
      @authors = []
      ids = @props.article.get('contributing_authors')
      async.each ids, (id, cb) =>
        request
          .get("#{sd.ARTSY_URL}/api/v1/user/#{id.id}")
          .set('X-Access-Token': sd.USER.access_token).end (err, res) =>
            @authors.push(
              {
                id: { id: res.body.id , name: res.body.name },
                value: _.compact([res.body.name, res.body.email]).join(', ')
              })
            cb()
      , =>
        list.setState loading: false, items: @authors
    else
      list.setState loading: false

  onPrimaryAuthorChange: (e) ->
    @setState author: e.target.value

  printScheduleButton: ->
    if @state.is_scheduled
      button {
        className: 'avant-garde-button scheduled'
        onClick: @onPublishUnschedule
      }
    else
      button {
        className: 'avant-garde-button'
        onClick: @onPublishSchedule
      }, 'Schedule'

  render: ->
    focus_date = if @state.focus_date then ' focused' else ''

    div { className: 'edit-admin--article edit-admin__fields'},

      div {className: 'fields-full'},
        div {className: 'fields-left'},
          div {className: 'field-group'},
            label {}, 'Primary Author'
            input {
              className: 'bordered-input'
              placeholder: 'Move this article to another author’s account'
              defaultValue: @state.author
              onChange: @onPrimaryAuthorChange
            }

        div {className: 'fields-right'},
          div {className: 'field-group'},
            label {}, 'Contributing Author'
            div {
              ref: 'autocomplete'
            }

      div {className: 'fields-full'},
        div {className: 'fields-left'},
          div {className: 'field-group publish-time'},
            label {}, 'Publish Time'
            div {className: 'field-group--inline'},
              input {
                type: 'date'
                className: 'bordered-input edit-admin-input-date' + focus_date
                ref: 'publish_date'
                onChange: @onPublishDateChange
                defaultValue: @state.publish_date
                onClick: @focusDate
                onBlur: @blurDate
                disabled: @state.is_scheduled
              }
              input {
                type: 'time'
                className: 'bordered-input edit-admin-input-date' + focus_date
                ref: 'publish_time'
                onChange: @onPublishDateChange
                value: @state.publish_time
                onClick: @focusDate
                onBlur: @blurDate
                disabled: @state.is_scheduled
              }
              @printScheduleButton()
            div {
              className: 'field-group--inline flat-checkbox'
              onClick: @onCheckboxChange
            },
              input {
                type: 'checkbox'
                checked: @state.exclude_google_news
                ref: 'exclude_google_news'
              }
              label {}, 'Exclude from Google News'


        div {className: 'fields-right'},
          div {className: 'field-group--inline tier-feed'},
            div {className: 'field-group'},
              label {}, 'Article Tier'
              div {className: 'button-group'},
                button {
                  className: 'avant-garde-button' + @showActiveTier(1)
                  onClick: @onTierChange
                  name: '1'
                }, 'Tier 1'
                button {
                  className: 'avant-garde-button' + @showActiveTier(2)
                  onClick: @onTierChange
                  name: '2'
                }, 'Tier 2'

            div {className: 'field-group'},
              label {}, 'Magazine Feed'
              div {className: 'button-group'},
                button {
                  className: 'avant-garde-button' + @showMagazineActive(true)
                  onClick: @onMagazineChange
                  name: 'true'
                }, 'Yes'
                button {
                  className: 'avant-garde-button' + @showMagazineActive(false)
                  onClick: @onMagazineChange
                }, 'No'
