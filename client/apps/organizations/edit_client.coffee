Backbone = require 'backbone'
Organization = require '../../models/organization.coffee'
Article = require '../../models/article.coffee'
ImageUploadForm = require '../../components/image_upload_form/index.coffee'
AutocompleteSelect = require '../../components/autocomplete_select/index.coffee'
sd = require('sharify').data

class OrganizationEditView extends Backbone.View

  initialize: ({ @organization }) ->
    @attachUploadForms()

  attachUploadForms: ->
    @$('.organizations-image-placeholder').each (i, el) =>
      new ImageUploadForm
        el: $(el)
        src: (
          if $(el).attr('data-name').match 'featured_links'
            @organization.get('featured_links')?[$(el).attr('data-index')]?.thumbnail_url
          else
            @organization.get $(el).attr 'data-name'
        )
        name: $(el).attr('data-name')

  events:
    'click .organizations-delete': 'destroy'
    'change :input': 'unsaved'
    'submit form': 'ignoreUnsaved'

  destroy: (e) ->
    e.preventDefault()
    return unless confirm "Are you sure you want to delete this organization?"
    @organization.destroy success: -> location.assign '/organizations'

  unsaved: ->
    window.onbeforeunload = ->
      "You have unsaved changes, do you wish to continue?"

  ignoreUnsaved: ->
    window.onbeforeunload = ->

@init = ->
  new OrganizationEditView
    organization: new Organization(sd.ORGANIZATION)
    el: $('body')
