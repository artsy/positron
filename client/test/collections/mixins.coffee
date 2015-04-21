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

    it 'fetches models by ids', (done) ->
      @artworks.getOrFetchIds ['foo', 'bar'], success: =>
        @artworks.pluck('id').join('').should.equal 'foobar'
        done()
      Backbone.sync.args[0][2].success { id: 'foo' }
      Backbone.sync.args[1][2].success { id: 'bar' }

    it '`completes` fine', (done) ->
      @artworks.getOrFetchIds ['foo', 'bar'], complete: =>
        @artworks.pluck('id').join('').should.equal 'foo'
        done()
      Backbone.sync.args[0][2].success { id: 'foo' }
      Backbone.sync.args[1][2].error {}, {}

  describe '#notIn', ->

    it 'pulls out the difference of two collections', ->
      a1 = new Artworks [{ id: 'foo' }, { id: 'bar' }]
      a2 = new Artworks [{ id: 'bar' }, { id: 'baz' }]
      new Artworks(a1.notIn(a2)).pluck('id').join('').should.equal 'foo'
