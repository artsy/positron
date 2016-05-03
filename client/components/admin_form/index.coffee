Backbone = require 'backbone'
ImageUploadForm = require '../image_upload_form/index.coffee'
propByString = require 'prop-by-string'
template = -> require('./link.jade') arguments...

module.exports = class AdminEditView extends Backbone.View

  initialize: ({ @onDeleteUrl }) ->
    @attachUploadForms()
    @featuredLinkLength = @model.get('featured_links')?.length or 0

  attachUploadForms: ->
    @$('.admin-image-placeholder').each (i, el) =>
      new ImageUploadForm
        el: $(el)
        src: propByString.get $(el).attr('data-name'), @model.attributes
        name: $(el).attr('data-name')

  events:
    'click .admin-form-delete': 'destroy'
    'change :input': 'unsaved'
    'submit form': 'ignoreUnsaved'
    'click .admin-form-add-new-link': 'newLink'

  destroy: (e) ->
    e.preventDefault()
    return unless confirm "Are you sure you want to delete this?"
    @model.destroy success: => location.assign @onDeleteUrl

  unsaved: ->
    window.onbeforeunload = ->
      "You have unsaved changes, do you wish to continue?"

  ignoreUnsaved: ->
    window.onbeforeunload = ->

  newLink: (e) =>
    e.preventDefault()
    nextIndex = @featuredLinkLength
    $('.admin-form-featured-links').append template
      i: nextIndex
    new ImageUploadForm
      el: @$(".admin-image-placeholder[data-index=#{nextIndex}]")
      name: "featured_links[#{nextIndex}][thumbnail_url]"
    @featuredLinkLength = @featuredLinkLength + 1
