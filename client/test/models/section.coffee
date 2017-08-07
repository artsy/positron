_ = require 'underscore'
Backbone = require 'backbone'
Section = require '../../models/section.coffee'
sinon = require 'sinon'
fixtures = require '../../../test/helpers/fixtures'
{ fabricate } = require 'antigravity'
benv = require 'benv'

describe "Article", ->

  beforeEach ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      sinon.stub Backbone, 'sync'
      @section = new Section fixtures().articles.sections[0]

  afterEach ->
    Backbone.sync.restore()

  describe '@getIframeUrl', ->

    it 'converts youtube urls to an iframe frriendly one', ->
      Section.getIframeUrl(
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      ).should.equal '//www.youtube.com/embed/dQw4w9WgXcQ'
      Section.getIframeUrl(
        'http://youtu.be/dQw4w9WgXcQ'
      ).should.equal '//www.youtube.com/embed/dQw4w9WgXcQ'

    it 'converts vimeo urls to an iframe frriendly one', ->
      Section.getIframeUrl(
        'http://vimeo.com/87031388'
      ).should.equal "//player.vimeo.com/video/87031388?color=ffffff"

  describe '#fetchSlideshowArtworks', ->

    it 'adds slideshow artworks to the section.artworks', (done) ->
      @section.fetchSlideshowArtworks success: =>
        id = @section.get('items')[0].id
        @section.artworks.findWhere(_id: id).get('title').should.equal 'Foo'
        done()
      Backbone.sync.args[0][2].success _.extend(
        fabricate('artwork'),
        { _id: @section.get('items')[0].id, title: 'Foo' }
      )

  describe 'toJSON', ->

    it 'maps the _ids from artworks for artwork sections', ->
      @section.set type: 'artworks'
      @section.artworks.reset(fabricate 'artwork', _id: 'foo')
      @section.toJSON().ids[0].should.equal 'foo'

  describe 'slugsFromHTML', ->

    it 'extracts a slug from an Artsy link', ->
      @section.set body: '<p><a href="http://artsy.net/artist/kana-abe"></p>'
      @section.slugsFromHTML('body','artist')[0].should.equal 'kana-abe'

    it 'extracts a slug from an Artsy link with query junk', ->
      @section.set body: '<p><a href="http://artsy.net/artist/kana-abe?foo=bar"></p>'
      @section.slugsFromHTML('body','artist')[0].should.equal 'kana-abe'

    it 'extracts a slug from a Google link', ->
      @section.set body: '<p><a href="https://www.google.com/url?q=https%3A%2F%2Fwww.artsy.net%2Fartist%2Ftrenton-doyle-hancock&sa=D&sntz=1"></p>'
      @section.slugsFromHTML('body','artist')[0].should.equal 'trenton-doyle-hancock'

  describe '#getLayout', ->

    it 'returns column width by default', ->
      layout = @section.getLayout()
      layout.should.eql 'column_width'

    it 'can return an existing layout', ->
      @section.set layout: 'fullscreen'
      layout = @section.getLayout()
      layout.should.eql 'fullscreen'

    it 'returns overflow if blockquote', ->
      @section.set type: 'text'
      @section.set body: '<blockquote>Cool pullquote</blockquote>'
      layout = @section.getLayout()
      layout.should.eql 'overflow_fillwidth'

    it 'returns blockquote if feature article', ->
      @section.set type: 'text'
      @section.set body: '<blockquote>Cool pullquote</blockquote>'
      layout = @section.getLayout('feature')
      layout.should.eql 'blockquote'
