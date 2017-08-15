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

    it 'finds artists mentioned in links and such', ->
      @sections.set [
        { type: 'artworks' }
        { type: 'text', body: "<p><a href='artsy.net/artist/foo'>Foo</a></p>" }
        { type: 'image', caption: "<p><a href='artsy.net/artist/bar'>Bar</a></p>" }
      ]
      @sections.first().artworks.set { artist: { id: 'baz' } }
      @sections.mentionedArtistSlugs().join('').should.equal 'bazfoobar'

  describe '#mentionedArtworkSlugs', ->

    it 'finds artists mentioned in links and such', ->
      @sections.set [
        { type: 'artworks', ids: ['baz'] }
        { type: 'text', body: "<p><a href='artsy.net/artworks/foo'>Foo</a></p>" }
        { type: 'image', caption: "<p><a href='artsy.net/artworks/bar'>Bar</a></p>" }
      ]
      @sections.mentionedArtworkSlugs().join('').should.equal 'bazfoobar'
