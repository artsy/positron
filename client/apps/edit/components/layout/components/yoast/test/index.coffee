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
      @YoastView = rewire '../index.coffee'
      @YoastView.__set__ 'Modal', sinon.stub()
      @YoastView.__set__ 'yoastSnippetPreview', -> { changedInput: -> }
      @YoastView.__set__ 'yoastApp', -> { refresh: -> }

      @view = new @YoastView
        el: tmpl
        contentField: 'Testing This Content Field'
        title: 'Test Title'
        slug: 'test-slug'
      done()

  afterEach ->
    benv.teardown()
    Backbone.sync.restore()

  describe '#initialize', ->

    xit 'adds yoast html to #yoast-container', ->
