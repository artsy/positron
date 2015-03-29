_ = require 'underscore'
Backbone = require 'backbone'
Artwork = require '../../models/artwork.coffee'
sinon = require 'sinon'
{ fabricate } = require 'antigravity'

describe "Artwork", ->

  beforeEach ->
    sinon.stub Backbone, 'sync'
    @artwork = new Artwork fabricate 'artwork'

  afterEach ->
    Backbone.sync.restore()

  describe '#truncatedLabel', ->

    it 'creates a nice short label for the artwork', ->
      @artwork.set
        title: 'Foo'
        date: 'Monday'
        artist: name: 'Andy Warhol'
      @artwork.truncatedLabel().should.equal 'A.W. Foo, Monday'
