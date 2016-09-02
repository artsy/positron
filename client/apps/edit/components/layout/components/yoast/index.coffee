Backbone = require 'backbone'
yoastSnippetPreview = require( "yoastseo" ).SnippetPreview
yoastApp = require( "yoastseo" ).App
Modal = -> require('simple-modal') arguments...
template = -> require('./yoast.jade') arguments...

module.exports = class YoastView extends Backbone.View

  initialize: (options) ->
    @modal = Modal
      title: 'SEO Analysis'
      content: "<div id='yoast-container'>"
      removeOnClose: true
      buttons: [
        { className: 'simple-modal-close', closeOnClick: true }
      ]
    $('.simple-modal-body').addClass 'yoast-modal'
    $('#yoast-container').html template

    focusKeywordField = document.getElementById( "edit-seo__focus-keyword" )
    contentField = document.getElementById( "edit-seo__content-field" )

    @snippetPreview = new yoastSnippetPreview
      targetElement: document.getElementById( "edit-seo__snippet" )

    app = new yoastApp
      snippetPreview: @snippetPreview,
      targets:
        output: "edit-seo__output"
      callbacks: 
        getData: ->
          return {
            keyword: focusKeywordField.value,
            text: contentField.value
          }
    app.refresh()
    $('.snippet-editor__button').addClass 'avant-garde-button'
    @snippetPreview.changedInput()

    $("#edit-seo__content-field").val(options.contentField)
    $("#snippet-editor-title").val(options.title)
    $("#snippet-editor-slug").val(options.slug)

    $('#edit-seo__focus-keyword').on 'keyup', (e) =>
      @onKeyup()

  onKeyup: =>
    @snippetPreview.changedInput()

