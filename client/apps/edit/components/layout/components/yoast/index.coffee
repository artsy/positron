Backbone = require 'backbone'
yoastSnippetPreview = require( "yoastseo" ).SnippetPreview
yoastApp = require( "yoastseo" ).App

module.exports = class YoastView extends Backbone.View

  events:
    'click .edit-seo__header-container': 'toggleDrawer'

  initialize: (options) ->
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
    @snippetPreview.changedInput()

    $("#edit-seo__content-field").val(options.contentField)
    $("#snippet-editor-title").val(options.title)
    $("#snippet-editor-slug").val(options.slug)

    $('#edit-seo__focus-keyword').on 'keyup', (e) =>
      @onKeyup()

  toggleDrawer: ->
    $('#yoast-container').slideToggle duration: 100, easing: 'linear'
    $('.edit-seo__close').toggleClass 'active'

  onKeyup: =>
    @snippetPreview.changedInput()
