_ = require 'underscore'
Backbone = require 'backbone'
Article = require '../../models/article.coffee'
sinon = require 'sinon'
{ fabricate } = require 'antigravity'
fixtures = require '../../../test/helpers/fixtures'
moment = require 'moment'

describe "Article", ->

  beforeEach ->
    sinon.stub Backbone, 'sync'
    @article = new Article fixtures().articles

  afterEach ->
    Backbone.sync.restore()

  describe '#initialize', ->

    it 'sets up a related sections collection', ->
      @article.sections.length.should.equal 7

  describe '#toJSON', ->

    it 'loops the sections collection back in', ->
      @article.sections.reset { body: 'Foobar' }
      @article.toJSON().sections[0].body.should.equal 'Foobar'

    it 'sections fall back to attrs', ->
      @article.set sections: [{ body: 'Foobar' }]
      @article.sections.reset []
      @article.toJSON().sections[0].body.should.equal 'Foobar'

    it 'serializes the hero section if there is data', ->
      @article.set hero_section: {}
      @article.heroSection.set type: 'video', url: 'foo'
      @article.toJSON().hero_section.type.should.equal 'video'
      @article.toJSON().hero_section.url.should.equal 'foo'

    it 'sets the hero section to null if there is no data', ->
      @article.set hero_section: {}
      JSON.stringify(@article.toJSON()).should.containEql '"hero_section":null'

    it 'serializes the lead paragraph if there is data', ->
      @article.set('lead_paragraph', '<p>hello</p>')
      @article.toJSON().lead_paragraph.should.eql '<p>hello</p>'

    it 'serializes the lead paragraph if there isnt any data', ->
      @article.set('lead_paragraph', '<p></p>')
      (@article.toJSON().lead_paragraph?).should.not.be.ok

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

  describe '#getPublishDate', ->

    it 'returns the current date if unpublished and no scheduled_publish_at', ->
      @article.set published: false
      now = moment().toISOString()
      @article.getPublishDate().should.containEql now

    it 'returns scheduled_publish_at if unpublished and scheduled', ->
      @article.set published: false
      scheduled = moment().add(1, 'years')
      @article.set('scheduled_publish_at', scheduled.toISOString())
      @article.getPublishDate().should.containEql scheduled.toISOString()

    it 'returns published_at if published', ->
      @article.set published: true
      published = moment().subtract(1, 'years')
      @article.set published_at: published.toISOString()
      @article.getPublishDate().should.containEql published.toISOString()

  describe '#getObjectAttribute', ->

    it 'returns the object attribute value if it exists', ->
      @article.getObjectAttribute('super_article', 'partner_link').should.equal 'http://partnerlink.com'
      @article.getObjectAttribute('email_metadata', 'headline').should.equal 'Foo'

  describe '#getFullSlug', ->

    it 'returns a slug with the artsy url', ->
      @article.getFullSlug().should.equal 'https://artsy.net/article/undefined-top-ten-booths-at-miart-2014'

  describe '#getByline', ->

    it 'returns the author when there are no contributing authors', ->
      @article.set 'contributing_authors', []
      @article.set 'author', { name: 'Molly' }
      @article.getByline().should.equal 'Molly'

    it 'returns the contributing author name if there is one', ->
      @article.set 'contributing_authors', [{name: 'Molly'}]
      @article.getByline().should.equal 'Molly'

    it 'returns "and" with two contributing authors', ->
      @article.set 'contributing_authors', [{name: 'Molly'}, {name: 'Kana'}]
      @article.getByline().should.equal 'Molly and Kana'

    it 'returns multiple contributing authors', ->
      @article.set 'contributing_authors', [{name: 'Molly'}, {name: 'Kana'}, {name: 'Christina'}]
      @article.getByline().should.equal 'Molly, Kana and Christina'

  describe '#date', ->

    it 'returns current date if no attribute is passed', ->
      now = moment().format('LL')
      @article.date().format('LL').should.equal now

    it 'returns published_at date if attribute is passed', ->
      @article.set 'published_at', 1360013296
      @article.date('published_at').format('LL').should.equal 'January 16, 1970'

  describe '#hasContributingAuthors', ->

    it 'returns a slug with the artsy url', ->
      @article.set 'contributing_authors', [ {name: 'Kana'} ]
      @article.hasContributingAuthors().should.be.true()

  describe '#getDescription', ->

    it 'defaults to description', ->
      @article.getDescription().should.containEql 'Just before the lines start forming'

    it 'finds custom description', ->
      @article.getDescription('search_description').should.containEql 'Search Description'

  describe '#getThumbnailImage', ->

    it 'defaults to thumbnail_image', ->
      @article.getThumbnailImage().should.containEql 'kitten'

    it 'finds custom thumbnail_image', ->
      @article.getThumbnailImage('social_image').should.containEql 'socialimage.jpg'

  describe '#getThumbnailTitle', ->

    it 'defaults to thumbnail_title', ->
      @article.getThumbnailTitle().should.containEql 'Top Ten Booths'

    it 'finds custom thumbnail_title', ->
      @article.getThumbnailTitle('search_title').should.containEql 'Search Title'

describe "Article simple mode", ->

  beforeEach ->
    sinon.stub Backbone, 'sync'
    data =
      daily_email: true
    @article = new Article data, simple: true

  afterEach ->
    Backbone.sync.restore()

  it 'does not create additional associations', ->
    @article.keys().length.should.equal 1

  describe '#toJSON', ->

    it 'serializes article data', ->
      JSON.stringify(@article.toJSON()).should.equal '{"daily_email":true}'

    it 'does not serialize associations', ->
      JSON.stringify(@article.toJSON()).should.not.containEql '"hero_section"'

    it 'serializes a hero_section with keys', ->
      @article.set('hero_section', {type: 'text'})
      JSON.stringify(@article.toJSON()).should.containEql '"hero_section"'
      JSON.stringify(@article.toJSON().hero_section.type).should.containEql '"text"'
