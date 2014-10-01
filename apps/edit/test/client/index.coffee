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
        { EditView } = require '../../client'
        @view = new EditView el: $ '#layout-content'
        done()

  afterEach ->
    benv.teardown()

  describe '#toggleTabs', ->

    it 'highlights missing fields if the author isnt done', ->
      @view.highlightMissingFields = sinon.stub()
      $('#edit-publish').click()
      @view.highlightMissingFields.called.should.be.ok
