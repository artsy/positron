Backbone = require 'backbone'
Modal = -> require('simple-modal') arguments...
template = -> require('./alert.jade') arguments...
flash = require '../flash/index.coffee'
sd = require('sharify').data

module.exports.ErrorModal = class ErrorModal extends Backbone.View

  initialize: (options = {}) ->
    { @title, @body, @error, @flashMessage } = options
    @modal = Modal
      content: template(error: @error)
      removeOnClose: true
      buttons: [{ className: 'simple-modal-close', closeOnClick: true }]
    @setElement $(@modal.m).find('.simple-modal-content')
    @$el.addClass 'error-modal'

  events:
    'click .error-modal-close': 'close'
    'click .error-modal-report-button': 'openIntercom'

  close: ->
    @modal.close()

  openIntercom: ->
    $('#intercom-launcher').click()
    $('.error-modal-report-button').hide()

module.exports.openErrorModal = (err) ->
  new ErrorModal error: err
