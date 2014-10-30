Backbone = require 'backbone'

module.exports = class EditHeader extends Backbone.View

  initialize: (options) ->
    { @article } = options
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
