_ = require 'underscore'
Backbone = require 'backbone'
Artwork = require '../../models/artwork.coffee'
sinon = require 'sinon'
fixtures = require '../../../test/helpers/fixtures'

describe "Artwork", ->

  beforeEach ->
    sinon.stub Backbone, 'sync'
    @artwork = new Artwork fixtures().artworks

  afterEach ->
    Backbone.sync.restore()

  describe '#truncatedLabel', ->

    it 'creates a nice short label for the artwork', ->
      @artwork.set
        artwork: title: 'Foo', date: 'Monday'
        artist: name: 'Andy Warhol'
      @artwork.truncatedLabel().should.equal 'A.W. Foo, Monday'
