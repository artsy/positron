_ = require 'underscore'
Backbone = require 'backbone'
Section = require '../../models/section.coffee'
sinon = require 'sinon'
fixtures = require '../../../test/helpers/fixtures'
{ fabricate } = require 'antigravity'

describe "Article", ->

  beforeEach ->
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
