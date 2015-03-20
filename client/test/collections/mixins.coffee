sinon = require 'sinon'
fixtures = require '../../../test/helpers/fixtures'
Backbone = require 'backbone'
_ = require 'underscore'
{ ApiCollection, Filter } = require '../../collections/mixins.coffee'

class Artworks extends Backbone.Collection

  _.extend @prototype, ApiCollection
  _.extend @prototype, Filter

describe 'Mixins', ->

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

  describe '#notIn', ->

    it 'pulls out the difference of two collections', ->
      a1 = new Artworks [{ id: 'foo' }, { id: 'bar' }]
      a2 = new Artworks [{ id: 'bar' }, { id: 'baz' }]
      new Artworks(a1.notIn(a2)).pluck('id').join('').should.equal 'foo'
