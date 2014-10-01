Backbone = require 'backbone'

@view = class EditView extends Backbone.View

  events:
    'keyup #edit-title input': 'toggleAsterisk'

  toggleAsterisk: ->
    fn = if $('#edit-title input').val() is '' then 'show' else 'hide'
    $('#edit-title .edit-required')[fn]()

@init = ->
  new EditView el: $ 'body'