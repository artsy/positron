Backbone = require 'backbone'
yoastSnippetPreview = require( "yoastseo" ).SnippetPreview
yoastApp = require( "yoastseo" ).App

module.exports = class YoastView extends Backbone.View

  events:
    'click .edit-seo__header-container': 'toggleDrawer'

  initialize: (options) ->
    @$msg = $('.edit-seo__unresolved-msg')
    @article = options.article

    focusKeywordField = document.getElementById( "edit-seo__focus-keyword" )
    contentField = document.getElementById( "edit-seo__content-field" )

    @snippetPreview = new yoastSnippetPreview
      targetElement: document.getElementById( "edit-seo__snippet" )

    @app = new yoastApp
      snippetPreview: @snippetPreview,
      targets:
        output: "edit-seo__output"
      callbacks:
        getData: ->
          return {
            keyword: focusKeywordField.value,
            text: contentField.value
          }
        saveScores: =>
          @generateResolveMessage()

    @setSnippetFields options.contentField
    @app.refresh()
    @snippetPreview.changedInput()

  setSnippetFields: (contentField) ->
    $("#edit-seo__content-field").val contentField
    $("#snippet-editor-title").val(
      @article.get('search_title') or
      @article.get('thumbnail_title') or
      @article.get('title') or
      '')
    $('#snippet-editor-title').val()
    $("#snippet-editor-meta-description").val(
      @article.get('search_description') or @article.get('description'))

  toggleDrawer: ->
    $('#yoast-container').slideToggle duration: 100, easing: 'linear'
    $('.edit-seo__close').toggleClass 'active'

  onKeyup: (contentField)->
    @setSnippetFields contentField
    @snippetPreview.changedInput()

  generateResolveMessage: =>
    unless $('#edit-seo__focus-keyword').val()
      @$msg
        .text " Set Target Keyword"
        .addClass 'bad'
    else if unresolved = $('#edit-seo__output .bad').length
      @$msg
        .text " #{unresolved} Unresolved Issue#{if unresolved > 1 then 's' else ''}"
        .addClass 'bad'
    else
      @$msg
        .text " Resolved"
        .removeClass 'bad'
