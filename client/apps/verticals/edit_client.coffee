Backbone = require 'backbone'
Vertical = require '../../models/vertical.coffee'
Article = require '../../models/article.coffee'
ImageUploadForm = require '../../components/image_upload_form/index.coffee'
AutocompleteSelect = require '../../components/autocomplete_select/index.coffee'
sd = require('sharify').data

class VerticalEditView extends Backbone.View

  initialize: ({ @vertical }) ->
    @attachUploadForms()
    @attachAutocompleteSelects()

  attachUploadForms: ->
    @$('.verticals-image-placeholder').each (i, el) =>
      new ImageUploadForm
        el: $(el)
        src: @vertical.get($(el).attr 'data-attr')
        name: $(el).attr('data-attr')

  attachAutocompleteSelects: ->
    @$('.verticals-article-input').each (i, el) =>
      select = AutocompleteSelect el,
        label: "Article #{i + 1}"
        name: "featured_article_ids[#{i}]"
        url: "#{sd.API_URL}/articles?q=%QUERY"
        placeholder: 'Search article by title...'
        filter: (res) -> for a in res.results
          { id: a.id, value: a.thumbnail_title + ' – ' + a.author?.name }
      id = @vertical.get('featured_article_ids')?[i]
      if id
        new Article(id: id).fetch
          success: (a) ->
            select.setState
              loading: false
              value: a.get('thumbnail_title') + ' – ' + a.get('author')?.name
              id: id
      else
        select.setState loading: false, value: null

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
