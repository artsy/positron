_ = require 'underscore'
_s = require 'underscore.string'
Backbone = require 'backbone'
sd = require('sharify').data
Channel = require '../../../../models/channel.coffee'
User = require '../../../../models/user.coffee'
YoastView = require './components/yoast/index.coffee'
async = require 'async'
request = require 'superagent'

module.exports = class EditLayout extends Backbone.View

  initialize: (options) ->
    { @article } = options
    @user = new User sd.USER
    @channel = new Channel sd.CURRENT_CHANNEL
    @$window = $(window)
    @article.sections.removeBlank()
    @article.sync = _.debounce _.bind(@article.sync, @article), 500
    @article.sections.on 'add remove reset', @addRemoveReset
    @article.on 'finished', @onFinished
    @article.on 'loading', @showSpinner
    @article.once 'sync', @onFirstSave if @article.isNew()
    @article.on 'savePublished', @savePublished
    if @channel?.isArtsyChannel()
      @setupYoast()
      @article.on 'change', @onYoastKeyup
    @setupOnBeforeUnload()

  onFirstSave: =>
    Backbone.history.navigate "/articles/#{@article.get 'id'}/edit"

  setupOnBeforeUnload: ->
    window.onbeforeunload = =>
      if $.active > 0
        "Your article is not finished saving."
      else if @changedSection is true and not @finished
        "You have unsaved changes, do you wish to continue?"
      else
        null

  serialize: ->
    {
      author_id: @user.get('id')
      seo_keyword: @$('input#edit-seo__focus-keyword').val()
    }

  redirectToList: =>
    location.assign '/articles?published=' + @article.get('published')

  showSpinner: =>
    @$('#edit-sections-spinner').show()

  onFinished: =>
    @finished = true
    @showSpinner()
    $(document).ajaxStop @redirectToList

  savePublished: =>
    @article.save @serialize()
    @onFinished()

  addRemoveReset: =>
    @changedSection = true

  events:
    'keyup #edit-seo__focus-keyword': 'onYoastKeyup'
    'click button.autolink' : 'autolinkText'

  setupYoast: ->
    @yoastView = new YoastView
      el: $('#edit-seo')
      article: @article
      contentField: @getBodyText()

  onYoastKeyup: ->
    return unless @channel?.isArtsyChannel()
    @yoastView.onKeyup @getBodyText()

  getBodyText: =>
    @fullText = []
    if @article.get('lead_paragraph')?.length
      @fullText.push @article.get('lead_paragraph')
    for section in @article.sections.models when section.get('type') is 'text'
      @fullText.push section.get('body')
    @fullText = @fullText.join()

  getLinkableText: ->
    fullText = @getBodyText()
    fullText.match(/==(\S[^==]*\S)==/ig)

  autolinkText: ->
    $('#autolink-status').addClass('searching').html('Linking...')
    $('#edit-content__overlay').addClass('disabled')
    linkableText = @getLinkableText()
    async.mapLimit linkableText, 5, ((findText, cb) =>
      text = findText.split('==').join('')
      request
        .get("/api/search?term=#{text}&type=artists,partners,cities")
        .set('X-Access-Token': sd.USER?.access_token)
        .end (err, res) =>
          if err or res.body.total < 1
            @article.replaceLink(findText, text)
            return cb()
          valid_results = @findValidResults(res.body.hits)
          if valid_results.length == 0
            @article.replaceLink(findText, text)
            return cb()

          @article.replaceLink(findText, @getNewLinkFromHits(valid_results) || text)
          return cb()
    ), (err, result) =>
      @article.sections.trigger 'change:autolink'
      $('#autolink-status').removeClass('searching').html('Auto-Link')
      $('#edit-content__overlay').removeClass('disabled')

  findValidResults: (hits) ->
    _.reject(hits, (h) -> h._score < 6 || h._source.visible_to_public == false)

  getNewLinkFromHits: (results) ->
    result = results[0]
    name = result._source.name
    link = @findLinkFromResult(result)
    return "<a href='#{link}'>#{name}</a>" if link

  findLinkFromResult: (result) ->
    switch result._type
      when "artist" then "#{sd.FORCE_URL}/artist/#{result._source.slug}"
      when "partner" then "#{sd.FORCE_URL}/#{result._source.slug}"
      when "city" then "#{sd.FORCE_URL}/shows/#{result._source.slug}"
      else null
