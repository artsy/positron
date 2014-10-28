Backbone = require 'backbone'

module.exports = class EditHeader extends Backbone.View

  initialize: (options) ->
    { @article } = options
    @article.on 'change', @saving
    @article.on 'sync', @doneSaving

  saving: =>
    @$('#edit-save').addClass 'is-saving'

  doneSaving: =>
    @$('#edit-save').removeClass 'is-saving'

  events:
    'click #edit-delete': 'delete'

  delete: ->
    return unless confirm "Are you sure?" # TODO: Implement Artsy branded dialog
    @article.destroy()
