Backbone = require 'backbone'
Modal = -> require('simple-modal') arguments...
template = -> require('./template.jade') arguments...
flash = require '../flash/index.coffee'
sd = require('sharify').data

module.exports.ErrorModal = class ErrorModal extends Backbone.View

  initialize: (options = {}) ->
    { @title, @body, @error, @flashMessage } = options
    @modal = Modal
      content: template
        title: @title or "Sorry, there was an error"
        body: @body or "Our engineers have been notified. " +
          "You can try again later or help us by submitting a bug report. " +
          "Thanks for your patience."
      removeOnClose: true
      buttons: [{ className: 'simple-modal-close', closeOnClick: true }]
    @setElement $(@modal.m).find('.simple-modal-content')
    @$el.addClass 'error-modal'

  events:
    'click .error-modal-close': 'close'

  close: ->
    @modal.close()

module.exports.openErrorModal = (err) ->
  new ErrorModal error: err
