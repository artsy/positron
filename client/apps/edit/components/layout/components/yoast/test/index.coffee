_ = require 'underscore'
benv = require 'benv'
sinon = require 'sinon'
rewire = require 'rewire'
Backbone = require 'backbone'
fixtures = require '../../../../../../../../test/helpers/fixtures'
{ resolve } = require 'path'

describe 'YoastView', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require('jquery')
      tmpl = $('<div id="yoast-container"></div>')
      Backbone.$ = $
      sinon.stub Backbone, 'sync'
      @YoastView = benv.requireWithJadeify '../index.coffee', ['template']
      @YoastView.__set__ 'Modal', sinon.stub()
      @keyup = sinon.stub @YoastView.prototype, 'onKeyup'
      $('body').html '<div id="yoast-container"></div>'

      @view = new @YoastView
        contentField: 'Testing This Content Field'
        title: 'Test Title'
        slug: 'test-slug'
      done()

  afterEach ->
    benv.teardown()
    Backbone.sync.restore()
    @YoastView::onKeyup.restore()

  describe '#initialize', ->

    it 'adds yoast html to #yoast-container', ->
      $('#yoast-container').html().should.containEql 'edit-seo__snippet'
      $('#yoast-container').html().should.containEql 'edit-seo__content-field'
      $('#yoast-container').html().should.containEql 'edit-seo__focus-keyword'

    it 'adds content, title, and slug to inputs', ->
      $('#edit-seo__content-field').val().should.equal 'Testing This Content Field'
      $('#snippet-editor-title').val().should.equal 'Test Title'
      $('#snippet-editor-slug').val().should.equal 'test-slug'

  describe '#onKeyup', ->

    it 'changes the output when the user adds a keyword', (done) ->
      $('#edit-seo__focus-keyword').val('Content')
      $('#edit-seo__focus-keyword').trigger 'keyup'
      _.defer =>
        @keyup.called.should.be.true()
        done()
