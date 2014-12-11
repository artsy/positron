_ = require 'underscore'
Backbone = require 'backbone'
CurrentUser = require '../../../../models/current_user.coffee'
sd = require('sharify').data

module.exports = class EditHeader extends Backbone.View

  initialize: (options) ->
    { @article } = options
    @user = new CurrentUser sd.USER
    @article.on 'change', @saving
    @article.on 'change', @toggleCheckmarks
    @article.on 'sync', @doneSaving
    @toggleCheckmarks()

  saving: =>
    @$('#edit-save').addClass 'is-saving'

  doneSaving: =>
    @$('#edit-save').removeClass 'is-saving'

  toggleCheckmarks: =>
    @$('#edit-tabs a:eq(0)').attr 'data-complete', @article.finishedContent()
    @$('#edit-tabs a:eq(1)').attr 'data-complete', @article.finishedThumbnail()
    @$('#edit-publish').attr('data-disabled',
      not @article.finishedContent() or not @article.finishedThumbnail())

  events: ->
    'click #edit-publish': 'togglePublished'
    'click #edit-delete': 'delete'
    'click #edit-save': 'save'
    'click #edit-sync-to-post': 'syncToPost'

  togglePublished: (e) ->
    e.preventDefault()
    e.stopPropagation()
    if @article.finishedContent() and @article.finishedThumbnail()
      @$('#edit-publish').text(
        if @article.get('published') then 'Unpublishing...' else 'Publishing...'
      )
      @article.trigger('finished').save published: not @article.get 'published'
    else
      @article.trigger 'missing'

  delete: (e) ->
    e.preventDefault()
    return unless confirm "Are you sure?" # TODO: Implement Artsy branded dialog
    @$('#edit-delete').text 'Deleting...'
    @article.trigger('finished').destroy()

  save: (e) ->
    e.preventDefault()
    @$('#edit-save').text 'Saving...'
    @article.trigger('finished').save()

  syncToPost: (e) ->
    e.preventDefault()
    @$('#edit-sync-to-post').text 'Syncing...'
    @article.trigger('finished').syncToPost
      accessToken: @user.get('access_token')
      success: (post) -> location.assign "#{sd.FORCE_URL}/post/#{post.id}"
