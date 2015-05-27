Backbone = require 'backbone'
Vertical = require '../../models/vertical.coffee'
Article = require '../../models/article.coffee'
ImageUploadForm = require '../../components/image_upload_form/index.coffee'
AutocompleteSelect = require '../../components/autocomplete_select/index.coffee'
sd = require('sharify').data

class VerticalEditView extends Backbone.View

  initialize: ({ @vertical }) ->
    @attachUploadForms()

  attachUploadForms: ->
    @$('.verticals-image-placeholder').each (i, el) =>
      new ImageUploadForm
        el: $(el)
        src: (
          if $(el).attr('data-name').match 'featured_links'
            @vertical.get('featured_links')?[$(el).attr('data-index')]?.thumbnail_url
          else
            @vertical.get $(el).attr 'data-name'
        )
        name: $(el).attr('data-name')

  events:
    'click .verticals-delete': 'destroy'
    'change :input': 'unsaved'
    'submit form': 'ignoreUnsaved'

  destroy: (e) ->
    e.preventDefault()
    return unless confirm "Are you sure you want to delete this vertical?"
    @vertical.destroy success: -> location.assign '/verticals'

  unsaved: ->
    window.onbeforeunload = ->
      "You have unsaved changes, do you wish to continue?"

  ignoreUnsaved: ->
    window.onbeforeunload = ->

@init = ->
  new VerticalEditView
    vertical: new Vertical(sd.VERTICAL)
    el: $('body')
