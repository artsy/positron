Backbone = require 'backbone'
_ = require 'underscore'
AutocompleteList = require '../../../components/autocomplete_list/index.coffee'
AutocompleteSortableList = require '../../../components/autocomplete_sortable_list/index.coffee'
ImageUploadForm = require '../../../components/image_upload_form/index.coffee'
Channel = require '../../../models/channel.coffee'
sd = require('sharify').data
async = require 'async'
request = require 'superagent'

module.exports.EditChannel = class EditChannel extends Backbone.View

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
        @channel.save pinned_articles: @indexPinnedArticles items
      removed: (e, item, items) =>
        @channel.save pinned_articles: @indexPinnedArticles items
      moved: (items) =>
        @channel.save pinned_articles: @indexPinnedArticles items
    if @pinnedArticles.length > 0
      @articles = []
      async.each @pinnedArticles, (article, cb) =>
        request
          .get("#{sd.APP_URL}/api/articles/#{article.id}")
          .set('X-Access-Token': sd.USER.access_token).end (err, res) =>
            @articles.push(
              {
                id: res.body.id,
                value: res.body.thumbnail_title
                index: article.index
              })
            cb()
      , =>
        pinned.setState loading: false, items: _.sortBy @articles, 'index'
    else
      pinned.setState loading: false

  indexPinnedArticles: (items) ->
    _.map items, (item, i) ->
      index: i,
      id: item.id

  setupBackgroundImageForm: ->
    new ImageUploadForm
      el: $('#channel-edit__image')
      src: @channel.get('image_url')
      remove: =>
        @channel.save image_url: null
      done: (src) =>
        @channel.save image_url: src

  saveMetadata: ->
    $button = @$('.js--channel-save-metadata')
    data =
      slug: $('input[name=slug]').val()
      tagline: $('input[name=tagline]').val()
      links: @linkArray()
    $button.addClass('is-loading')
    @channel.save data,
      success: ->
        $button
          .removeClass('is-loading')
          .removeClass('is-error')
          .text 'Saved'
      error: ->
        $button
          .addClass('is-error')
          .removeClass('is-loading')
          .text 'Error Saving'

  linkArray: ->
    _(3).times (i) ->
      {
        text: $("input[name='links[#{i}][text]']").val()
        url: $("input[name='links[#{i}][url]']").val()
      }

module.exports.init = ->
  new EditChannel
    el: $('body')
