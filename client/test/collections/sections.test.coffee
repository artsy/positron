_ = require 'underscore'
Backbone = require 'backbone'
Sections = require '../../collections/sections.coffee'
sinon = require 'sinon'
fixtures = require '../../../test/helpers/fixtures'
benv = require 'benv'

describe "Sections", ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      sinon.stub Backbone, 'sync'
      @sections = new Sections fixtures().articles.sections
      done()

  afterEach ->
    Backbone.sync.restore()
    benv.teardown(0)

  describe '#mentionedArtistSlugs', ->

    it 'finds artists mentioned in links and artworks', ->
      @sections.set [
        { type: 'image_collection', images: [ type: 'artwork', artists: [ id: 'baz'] ] }
        { type: 'text', body: "<p><a href='artsy.net/artist/foo'>Foo</a></p>" }
        { type: 'image_set', images: [ type: 'image', caption: "<p><a href='artsy.net/artist/bar'>Bar</a></p>" ]}
      ]
      @sections.mentionedArtistSlugs().join('').should.equal 'bazfoobar'

  describe '#mentionedArtworkSlugs', ->

    it 'finds artists mentioned in links and artworks', ->
      @sections.set [
        { type: 'image_collection', images: [ type: 'artwork', slug: 'baz' ] }
        { type: 'text', body: "<p><a href='artsy.net/artworks/foo'>Foo</a></p>" }
        { type: 'image_set', images: [type: 'image', caption: "<p><a href='artsy.net/artworks/bar'>Bar</a></p>"]}
      ]
      @sections.mentionedArtworkSlugs().join('').should.equal 'bazfoobar'
