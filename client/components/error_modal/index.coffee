Backbone = require 'backbone'
Modal = require 'simple-modal'
template = -> require('./template.jade') arguments...

module.exports.ErrorModal = class ErrorModal extends Backbone.View

  className: 'error-modal'

  tagName: 'section'

  initialize: (options = {}) ->
    { @title, @body } = options
    @modal = Modal
      content: template
        title: @title or "Sorry, there was an unexpected error."
        body: @body or "Please try again later or report the issue to our " +
          " engineers. Thanks for your patience."
      removeOnClose: true
      buttons: [{ className: 'simple-modal-close', closeOnClick: true }]

  events:
    'click .error-modal-report-button': -> @$el.attr 'data-state', 'report'
    'click .error-modal-close': -> @modal.close()
