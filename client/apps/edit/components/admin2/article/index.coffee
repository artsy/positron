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

module.exports = AdminArticle = React.createClass
  displayName: 'AdminArticle'

  getInitialState: ->
    author:
      name: @props.article.get('author')?.name || ''
      id: @props.article.get('author')?.id
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

  componentWillUnmount: ->
    $(@refs['autocomplete']).each (i, ref) ->
      ReactDOM.unmountComponentAtNode(ref)

  onChange: (key, value)->
    newState = @state
    newState[key] = value
    @setState newState
    @props.onChange(key, value)

  onTierChange: (e) ->
    tier = parseInt(e.target.name)
    @onChange('tier', tier)

  onPrimaryAuthorChange: (e) ->
    @onChange('author', {name: e.target.value, id: @state.author.id})

  onMagazineChange: (e) ->
    featured = if e.target.name is 'true' then true else false
    @onChange('featured', featured)

  onCheckboxChange: (e) ->
    @setState exclude_google_news: !@state.exclude_google_news
    @onChange('exclude_google_news', !@state.exclude_google_news)

  onPublishDateChange: (e) ->
    @setState publish_date: @refs.publish_date.value
    @setState publish_time: @refs.publish_time.value
    published_at = moment(@state.publish_date + ' ' + @state.publish_time).toISOString()
    @onChange 'published_at', published_at

  onPublishSchedule: (e) ->
    publish_date = moment(@state.publish_date + ' ' + @state.publish_time).toISOString()
    @setState scheduled_publish_at: publish_date, is_scheduled: true

  onPublishUnschedule: ->
    @setState scheduled_publish_at: null, is_scheduled: false

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
        # @setState contributing_authors: _.pluck items, 'id'
        @onChange 'contributing_authors', _.pluck items, 'id'
      removed: (e, item, items) =>
        # @setState contributing_authors: _.without(_.pluck(items, 'id'),item.id)
        @onChange 'contributing_authors', _.without(_.pluck(items, 'id'),item.id)
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

  showActive: (key, value) ->
    active = if @state[key] is value then ' active' else ''

  render: ->
    div { className: 'edit-admin--article edit-admin__fields'},

      div {className: 'fields-full'},
        div {className: 'fields-left'},
          div {className: 'field-group'},
            label {}, 'Primary Author'
            input {
              className: 'bordered-input'
              placeholder: 'Change Primary Author name'
              defaultValue: @state.author.name
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
                  className: 'avant-garde-button' + @showActive('featured', true)
                  onClick: @onMagazineChange
                  name: 'true'
                }, 'Yes'
                button {
                  className: 'avant-garde-button' + @showActive('featured', false)
                  onClick: @onMagazineChange
                }, 'No'

        div {className: 'fields-right'},
          div {className: 'field-group publish-time'},
            label {}, 'Publish Time'
            div {className: 'field-group--inline'},
              input {
                type: 'date'
                className: 'bordered-input edit-admin-input-date' + @showActive('focus_date', true)
                ref: 'publish_date'
                onChange: @onPublishDateChange
                defaultValue: @state.publish_date
                onClick: @focusDate
                onBlur: @blurDate
              }
              input {
                type: 'time'
                className: 'bordered-input edit-admin-input-date' + @showActive('focus_date', true)
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
                defaultChecked: @state.exclude_google_news
                ref: 'exclude_google_news'
              }
              label {}, 'Exclude from Google News'

