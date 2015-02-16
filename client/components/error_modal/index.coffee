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
        title: @title or "Sorry, there was an unexpected error."
        body: @body or "Please try again later or report the issue to our " +
          " engineers. <br> Thank you for your patience."
      removeOnClose: true
      buttons: [{ className: 'simple-modal-close', closeOnClick: true }]
    @setElement $(@modal.m).find('.simple-modal-content')
    @$el.addClass 'error-modal'

  events:
    'click .error-modal-report-button': 'reportMode'
    'click .error-modal-close': 'close'
    'submit .error-modal-report form': 'submitReport'

  reportMode: ->
    @$el.attr 'data-state', 'report'
    @$('.error-modal-report-textarea').focus()

  close: ->
    @modal.close()

  submitReport: (e) ->
    e.preventDefault()
    console.log @$('.error-modal-report-textarea').val()
    $.ajax
      url: "#{sd.API_URL}/report"
      data:
        html: """
        <b>Message:</b>
        <div>#{@$('.error-modal-report-textarea').val()}</div>
        <br>
        <b>Error message:</b>
        <pre>#{@error.message}</pre>
        <br>
        <b>Stack trace:</b>
        <pre>#{@error.stack}</pre>
        """
    flash
      message: @flashMessage or "Thanks for your bug report."
      timeout: 2000
    @close()

module.exports.openErrorModal = (err) ->
  new ErrorModal error: err
