_ = require 'underscore'
Backbone = require 'backbone'
Article = require '../../models/article.coffee'
sinon = require 'sinon'
{ fabricate } = require 'antigravity'
fixtures = require '../../../test/helpers/fixtures'

describe "Article", ->

  beforeEach ->
    sinon.stub Backbone, 'sync'
    @article = new Article fixtures().articles

  afterEach ->
    Backbone.sync.restore()

  describe '#initialize', ->

    it 'sets up a related sections collection', ->
      @article.sections.length.should.equal 6

  describe '#toJSON', ->

    it 'loops the sections collection back in', ->
      @article.sections.reset { body: 'Foobar' }
      @article.toJSON().sections[0].body.should.equal 'Foobar'

    it 'sections fall back to attrs', ->
      @article.set sections: [{ body: 'Foobar' }]
      @article.sections.reset []
      @article.toJSON().sections[0].body.should.equal 'Foobar'

    it 'injects features artworks & artists', ->
      @article.featuredArtworks.set [fabricate('artist')]
      @article.featuredArtists.set [fabricate('artist')]
      @article.featuredPrimaryArtists.set [fabricate('artist')]
      @article.toJSON().featured_artwork_ids.length.should.equal 1
      @article.toJSON().featured_artist_ids.length.should.equal 1
      @article.toJSON().primary_featured_artist_ids.length.should.equal 1

    it 'nulls a hero section if there isnt any data', ->
      @article.set hero_section: {}
      @article.heroSection.clear()
      (@article.toJSON().hero_section?).should.not.be.ok

    it 'serializes the hero section if there is data', ->
      @article.set hero_section: {}
      @article.heroSection.set type: 'video', url: 'foo'
      @article.toJSON().hero_section.type.should.equal 'video'
      @article.toJSON().hero_section.url.should.equal 'foo'

  describe '#finishedContent', ->

    it 'returns true if theres a title', ->
      @article.set title: 'foo'
      @article.finishedContent().should.be.ok

    it 'returns true if finished all thumbnail stuff', ->
      @article.set
        thumbnail_title: 'bar'
        thumbnail_image: 'foo.jpg'
        thumbnail_teaser: 'baz'
        tags: ['foo']
      @article.finishedThumbnail().should.be.ok

  describe '#featuredList', ->

    it 'returns a mapped list of featured/mentioned artists ordered by name', ->
      @article.mentionedArtists.reset(
        [
          _.extend(fabricate 'artist', id: 'andy', name: 'Andy')
          _.extend(fabricate 'artist', id: 'charles', name: 'Charles')
        ])
      @article.featuredArtists.reset(
        [
          _.extend(fabricate 'artist', id: 'bob', name: 'Bob')
        ])
      _.map(@article.featuredList('Artists'), (i) -> i.model.id).join('')
        .should.equal 'andybobcharles'
      _.map(@article.featuredList('Artists'), (i) -> String i.featured).join('')
        .should.equal 'falsetruefalse'

  describe 'heroSection', ->

    it 'comes with a hero section that clears on destroy to manage state better', ->
      @article.heroSection.destroy.toString()
        .should.equal @article.heroSection.clear.toString()

    it 'updates on sync bc we may use an empty model and then fetch later', ->
      @article.set hero_section: { type: 'foo' }
      @article.trigger 'sync'
      @article.heroSection.get('type').should.equal 'foo'

  describe 'getObjectAttribute', ->

    it 'returns the object attribute value if it exists', ->
      @article.getObjectAttribute('super_article', 'partner_link').should.equal 'http://partnerlink.com'
      @article.getObjectAttribute('email_metadata', 'headline').should.equal 'Foo'