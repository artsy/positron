_ = require 'underscore'
benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'

describe 'ContributorsView', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: require('jquery')
      Backbone.$ = $
      sinon.stub Backbone, 'sync'
      { ContributorsView } = benv.require resolve __dirname, '../client'
      ContributorsView::setupAutocomplete = sinon.stub()
      @view = new ContributorsView el: $('body'), users: new Backbone.Collection
      done()

  afterEach ->
    benv.teardown(false)
    Backbone.sync.restore()

  describe '#onSelect', ->

    it 'adds the user to Writer', ->
      @view.onSelect {}, { id: 'foo' }
      Backbone.sync.args[0][1].toJSON().artsy_id.should.equal 'foo'