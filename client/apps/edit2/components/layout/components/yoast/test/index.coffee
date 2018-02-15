_ = require 'underscore'
benv = require 'benv'
sinon = require 'sinon'
rewire = require 'rewire'
Backbone = require 'backbone'
Article = require '../../../../../../../models/article.coffee'
fixtures = require '../../../../../../../../test/helpers/fixtures'
{ resolve } = require 'path'

describe 'YoastView', ->

  beforeEach (done) ->
    benv.setup =>
      tmpl = resolve __dirname, '../yoast.jade'
      locals = _.extend fixtures().locals,
        article: @article = new Article fixtures().articles
      benv.render tmpl, locals, =>
        benv.expose $: benv.require('jquery')
        Backbone.$ = $
        sinon.stub Backbone, 'sync'
        @YoastView = benv.require resolve __dirname, '../index'
        @YoastView.__set__ 'yoastApp', @yoastApp = sinon.stub().returns(
          refresh: ->
        )
        @YoastView.__set__ 'yoastSnippetPreview', @yoastSnippetPreview = sinon.stub().returns(
          changedInput: @changedInput = sinon.stub()
        )
        $('#yoast-container').append """
          <input id='snippet-editor-title'>
          <input id='snippet-editor-meta-description'>
          <div class='edit-seo__unresolved-msg'></div>
        """
        @view = new @YoastView
          el: $('body')
          contentField: 'Testing This Content Field'
          article: @article
        done()

  afterEach ->
    benv.teardown()
    Backbone.sync.restore()

  describe '#initialize', ->

    it 'sets up Yoast plugins', ->
      @yoastApp.callCount.should.equal 1
      @yoastSnippetPreview.callCount.should.equal 1

  describe 'setSnippetFields', ->

    it 'sets input vals according to article data', ->
      @view.setSnippetFields 'Testing this updated content field'
      $('#edit-seo__content-field').val().should.containEql 'Testing this updated content field'
      $('#snippet-editor-title').val().should.containEql 'Search Title'
      $('#snippet-editor-meta-description').val().should.containEql 'Search Description Here.'

  describe '#onKeyup', ->

    it 'resets the snippet fields when a change is made', ->
      $('#edit-seo__focus-keyword').val('Content')
      @view.onKeyup('new content')
      $('#edit-seo__content-field').val().should.containEql 'new content'
      @changedInput.callCount.should.equal 2

  describe '#generateResolveMessage', ->

    it 'creates a message for unresolved issues', ->
      $('#edit-seo__focus-keyword').val('Content')
      $('#edit-seo__output').html "<div class='bad'></div>"
      @view.generateResolveMessage()
      $('.edit-seo__unresolved-msg').hasClass('bad').should.be.true()
      $('.edit-seo__unresolved-msg').text().should.containEql '1 Unresolved Issue'

    it 'creates a message for all resolved', ->
      $('#edit-seo__focus-keyword').val('Content')
      $('#edit-seo__output').html "<div class='good'></div>"
      @view.generateResolveMessage()
      $('.edit-seo__unresolved-msg').hasClass('bad').should.be.false()
      $('.edit-seo__unresolved-msg').text().should.containEql 'Resolved'
    it 'creates a message when no target keyword is set', ->
      $('#edit-seo__focus-keyword').val('')
      @view.generateResolveMessage()
      $('.edit-seo__unresolved-msg').hasClass('bad').should.be.true()
      $('.edit-seo__unresolved-msg').text().should.containEql 'Set Target Keyword'