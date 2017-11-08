_ = require 'underscore'
Backbone = require 'backbone'
User = require '../../../../models/user.coffee'
sd = require('sharify').data

module.exports = class EditHeader extends Backbone.View

  initialize: (options) ->
    { @article } = options
    @finished = false
    @user = new User sd.USER
    unless sd.EDIT_2
      @article.on 'change', @saving
    @article.on 'change', @toggleCheckmarks
    @article.on 'error', @error
    @article.on 'sync', @done
    @toggleCheckmarks()

  error: (model, e) =>
    @finished = false
    console.error "#{e.status}: #{e.responseText}."
    @$('#edit-delete').text 'Delete'
    @$('#edit-save').removeClass('is-saving').text('Save')
    @$('#edit-error').text(e.responseText).show()

  saving: =>
    @$('#edit-error').hide()
    @$('#edit-save').addClass('is-saving')

  done: =>
    @$('#edit-save').removeClass('is-saving')
    @article.trigger('finished') if @finished

  toggleCheckmarks: =>
    @$('#edit-tabs a:eq(0)').attr 'data-complete', @article.finishedContent()
    @$('#edit-tabs a:eq(1)').attr 'data-complete', @article.finishedThumbnail()
    @$('#edit-publish').attr('data-disabled',
      not @article.finishedContent() or not @article.finishedThumbnail())

  events: ->
    'click #edit-publish': 'togglePublished'
    'click #edit-delete': 'delete'
    'click #edit-save': 'save'

  togglePublished: (e) ->
    @finished = true
    e.preventDefault()
    e.stopPropagation()
    if @article.finishedContent() and @article.finishedThumbnail()
      @$('#edit-publish').text(
        if @article.get('published') then 'Unpublishing...' else 'Publishing...'
      )
      @article.save(published: not @article.get 'published')
    else
      @article.trigger 'missing'

  delete: (e) ->
    e.preventDefault()
    return unless confirm "Are you sure?" # TODO: Implement Artsy branded dialog
    @$('#edit-delete').text 'Deleting...'
    @finished = true
    @article.destroy()

  save: (e) ->
    e.preventDefault()
    # Handles race condition to set props in a section that hasn't been clicked out of
    $('.edit-section-container-bg')[0]?.click()
    @$('#edit-save').text('Saving...')
    @finished = true
    if @article.get('published')
      @article.trigger('savePublished')
    else
      @article.save()
