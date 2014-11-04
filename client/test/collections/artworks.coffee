_ = require 'underscore'
Backbone = require 'backbone'
Artworks = require '../../collections/artworks.coffee'
sinon = require 'sinon'
fixtures = require '../../../test/helpers/fixtures'

describe "Article", ->

  beforeEach ->
    sinon.stub Backbone, 'sync'
    @artworks = new Artworks fixtures().artworks

  afterEach ->
    Backbone.sync.restore()

  describe '#getOrFetchIds', ->

    it 'fetches artworks by ids', (done) ->
      @artworks.getOrFetchIds ['foo', 'bar'], success: =>
        @artworks.pluck('id').join('').should.equal 'foobar'
        done()
      Backbone.sync.args[0][2].success results: [{ id: 'foo' }, { id: 'bar' }]

    it 'does not fetch artworks that have already been fetched', (done) ->
      @artworks.set [{ id: 'foo' }, { id: 'bar' }]
      @artworks.getOrFetchIds ['foo', 'bar'], success: =>
        @artworks.pluck('id').join('').should.equal 'foobar'
        done()
      Backbone.sync.called.should.not.be.ok

    it 'only fetches artworks that have not already been fetched', (done) ->
      @artworks.set [{ id: 'foo' }]
      @artworks.getOrFetchIds ['foo', 'bar'], success: =>
        @artworks.pluck('id').join('').should.equal 'foobar'
        done()
      Backbone.sync.args[0][2].data.ids.join('').should.equal 'bar'
      Backbone.sync.args[0][2].success results: [{ id: 'bar' }]
