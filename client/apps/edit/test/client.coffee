benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
rewire = require 'rewire'
Client = rewire '../client.coffee'
fixtures = require '../../../../test/helpers/fixtures'

describe 'init', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require('jquery')
      Backbone.$ = $
      window.jQuery = $
      sinon.stub Backbone, 'sync'
      Client.__set__ 'EditLayout', @EditLayout = sinon.stub()
      Client.__set__ 'EditHeader', @EditHeader = sinon.stub()
      Client.__set__ 'EditAdmin', @EditAdmin = sinon.stub()
      Client.__set__ 'EditDisplay', @EditDisplay = sinon.stub()
      Client.__set__ 'SectionList', @SectionList = sinon.stub()
      Client.__set__ 'HeroSection', @HeroSection = sinon.stub()
      Client.__set__ 'React', sinon.stub()
      Client.__set__ 'sd', { ARTICLE: fixtures().articles }
      @view = new Client
        el: $('body')
        article: fixtures().articles
      done()

  afterEach ->
    benv.teardown()
    Backbone.sync.restore()

  it 'initializes Backbone layouts and React components', ->
    console.log @EditLayout.callCount()

  it 'converts legacy articles to ImageCollection', ->

  it 'makes sure ImageSets images have widths and heights', ->

  it 'converts image components to image_collection', ->
    @SectionContainer.args[2][0].section.attributes.type.should.equal 'image_collection'
    @SectionContainer.args[2][0].section.attributes.images[0].type.should.equal 'image'
    @SectionContainer.args[2][0].section.attributes.images[0].url.should.equal 'http://artsy.net/image.jpg'

  it 'converts artwork components to image_collection', ->
    @SectionContainer.args[3][0].section.attributes.type.should.equal 'image_collection'
    @SectionContainer.args[3][0].section.attributes.images[0].type.should.equal 'artwork'
    @SectionContainer.args[3][0].section.attributes.images[0].artists[0].slug.should.equal 'rodrigo-valenzuela'
    @SectionContainer.args[3][0].section.attributes.images[1].artists[0].slug.should.equal 'rodrigo-valenzuela-2'
