Backbone = require 'backbone'
# TODO: Verify that this still works
Modal = -> require('simple-modal') arguments...
template = -> require('./alert.jade') arguments...
sd = require('sharify').data

module.exports.ErrorModal = class ErrorModal extends Backbone.View

  initialize: (options = {}) ->
    { @title, @body, @error } = options
    @modal = Modal
      content: template(error: @error)
      removeOnClose: true
      buttons: [{ className: 'simple-modal-close', closeOnClick: true }]
    @setElement $(@modal.m).find('.simple-modal-content')
    @$el.addClass 'error-modal'

  events:
    'click .error-modal-close': 'close'

  close: (e) ->
    e.preventDefault()
    @modal.close()

module.exports.openErrorModal = (err) ->
  new ErrorModal error: err
