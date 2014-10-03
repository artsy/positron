_ = require 'underscore'
benv = require 'benv'
sinon = require 'sinon'
Article = require '../../../../models/article'
Backbone = require 'backbone'
fixtures = require '../../../../test/helpers/fixtures'
{ resolve } = require 'path'

describe 'EditView', ->

  beforeEach (done) ->
    benv.setup =>
      tmpl = resolve __dirname, '../../templates/index.jade'
      benv.render tmpl, _.extend(fixtures.locals,
        article: @article = new Article fixtures.article
      ), =>
        benv.expose $: require('jquery')
        Backbone.$ = $
        sinon.stub Backbone, 'sync'
        { EditView } = require '../../client'
        sinon.stub _, 'debounce'
        _.debounce.callsArg 0
        @view = new EditView el: $('#layout-content'), article: @article
        done()

  afterEach ->
    benv.teardown()
    Backbone.sync.restore()
    _.debounce.restore()

  describe '#toggleTabs', ->

    it 'highlights missing fields if the author isnt done', ->
      @view.highlightMissingFields = sinon.stub()
      $('#edit-publish').click()
      @view.highlightMissingFields.called.should.be.ok

  describe '#autosave', ->

    it 'autosaves on debounce keyup', ->
      $('#edit-title input').trigger 'keyup'
      Backbone.sync.called.should.be.ok

  describe 'on destroy', ->

    it 'redirects to the root', ->
      location.assign = sinon.stub()
      @view.article.destroy()
      location.assign.args[0][0].should.containEql '/articles?state='
