_ = require 'underscore'
Backbone = require 'backbone'
fixtures = require '../../../test/helpers/fixtures'
rewire = require 'rewire'
Article = rewire '../../models/article.coffee'
sinon = require 'sinon'
{ fabricate } = require 'antigravity'
fixtures = require '../../../test/helpers/fixtures'
moment = require 'moment'

describe "Article", ->

  beforeEach ->
    sinon.stub Backbone, 'sync'
    Article.__set__ 'sd', {FORCE_URL: 'https://artsy.net'}
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

    it 'serializes the lead paragraph if there is data', ->
      @article.set('lead_paragraph', '<p>hello</p>')
      @article.toJSON().lead_paragraph.should.eql '<p>hello</p>'

    it 'serializes the lead paragraph if there isnt any data', ->
      @article.set('lead_paragraph', '<p></p>')
      (@article.toJSON().lead_paragraph?).should.not.be.ok

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
