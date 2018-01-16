_ = require 'underscore'
Backbone = require 'backbone'
Artwork = require '../../models/artwork.coffee'
sinon = require 'sinon'
{ fabricate } = require 'antigravity'

describe "Artwork", ->

  beforeEach ->
    sinon.stub Backbone, 'sync'
    @artwork = new Artwork _.extend {}, fabricate 'artwork',
      title: 'Foo'
      date: '1/1/2017'
      id: 'foo'
      artists: [
        name: 'Andy Warhol'
        id: 'andy-warhol'
      ]
      partner: {
        name: 'MOMA'
        default_profile_public: true
        default_profile_id: 'moma'
      }

  afterEach ->
    Backbone.sync.restore()

  it 'creates a nice short label for the artwork', ->
    @artwork.truncatedLabel().should.equal 'A.W. Foo, 1/1/2017'

  it 'denormalizes artworks', ->
    denormalized = @artwork.denormalized()
    denormalized.type.should.equal 'artwork'
    denormalized.id.should.equal '564be09ab202a319e90000e2'
    denormalized.slug.should.equal 'foo'
    denormalized.date.should.equal '1/1/2017'
    denormalized.title.should.equal 'Foo'
    denormalized.image.should.equal '/local/additional_images/4e7cb83e1c80dd00010038e2/1/larger.jpg'
    denormalized.partner.name.should.equal 'MOMA'
    denormalized.partner.slug.should.equal 'moma'
    denormalized.artists[0].name.should.equal 'Andy Warhol'
    denormalized.artists[0].slug.should.equal 'andy-warhol'
    denormalized.width.should.equal 1000
    denormalized.height.should.equal 585
    denormalized.credit.should.equal 'Sourced from ARS'
