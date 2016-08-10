Backbone = require 'backbone'
AutocompleteList = require '../../../components/autocomplete_list/index.coffee'
AutocompleteSortableList = require '../../../components/autocomplete_sortable_list/index.coffee'
ImageUploadForm = require '../../../components/image_upload_form/index.coffee'
Channel = require '../../../models/channel.coffee'
sd = require('sharify').data
async = require 'async'
request = require 'superagent'

module.exports = class EditChannel extends Backbone.View

  events:
    'click .js--channel-save-metadata': 'saveMetadata'

  initialize: ->
    @channel = new Channel sd.CHANNEL
    @setupUserAutocomplete()
    @setupPinnedArticlesAutocomplete()
    @setupBackgroundImageForm()

  setupUserAutocomplete: ->
    @user_ids = @channel.get 'user_ids' or []
    list = new AutocompleteList $('#channel-edit__users')[0],
      name: 'user_ids[]'
      url: "#{sd.ARTSY_URL}/api/v1/match/users?term=%QUERY"
      placeholder: 'Search by user name or email...'
      filter: (users) -> for user in users
        { id: user.id, value: _.compact([user.name, user.email]).join(', ')}
      selected: (e, item, items) =>
        @channel.save user_ids: _.pluck items, 'id'
      removed: (e, item, items) =>
        @channel.save user_ids: _.without(_.pluck(items, 'id'),item.id)
    if @user_ids.length > 0
      @users = []
      async.each @user_ids, (id, cb) =>
        request
          .get("#{sd.ARTSY_URL}/api/v1/user/#{id}")
          .set('X-Access-Token': sd.USER.access_token).end (err, res) =>
            @users.push(
              {
                id: res.body.id,
                value: _.compact([res.body.name, res.body.email]).join(', ')
              })
            cb()
      , =>
        list.setState loading: false, items: @users
    else
      list.setState loading: false

  setupPinnedArticlesAutocomplete: ->
    @pinnedArticles = @channel.get('pinned_articles') or []
    pinned = new AutocompleteSortableList $('#channel-edit__pinned-articles')[0],
      name: 'pinned_articles[]'
      url: "#{sd.APP_URL}/api/articles?published=true&channel_id=#{@channel.get('id')}&q=%QUERY"
      placeholder: 'Search by article title...'
      filter: (articles) -> for article in articles.results
        { id: article.id, value: article.thumbnail_title }
      selected: (e, item, items) =>
        pinned = @channel.get('pinned_articles').push { id: item.id, index: items.length }
        @channel.save pinned_articles: pinned
      removed: (e, item, items) =>
        # pinned = @channel.get('pinned_articles').
        @channel.save pinned_articles: _.without(_.pluck(items, 'id'),item.id)
      moved: (items) =>
        @channel.save pinned_articles: _.pluck items, 'id'
    if @pinnedArticles.length > 0
      @articles = []
      async.each @pinnedArticles, (id, cb) =>
        request
          .get("#{sd.APP_URL}/api/articles/#{id}")
          .set('X-Access-Token': sd.USER.access_token).end (err, res) =>
            @articles.push(
              {
                id: res.body.id,
                value: res.body.thumbnail_title
              })
            cb()
      , =>
        pinned.setState loading: false, items: @articles
    else
      pinned.setState loading: false

  setupBackgroundImageForm: ->
    new ImageUploadForm
      el: $('#channel-edit__image')
      src: @channel.get('image_url')
      remove: =>
        @channel.save image_url: null
      done: (src) =>
        @channel.save image_url: src

  saveMetadata: (e) ->
    console.log 'here!'