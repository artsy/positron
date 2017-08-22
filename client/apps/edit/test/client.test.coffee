benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
rewire = require 'rewire'
fixtures = require '../../../../test/helpers/fixtures'

describe 'init', ->

  beforeEach (done) ->
    global.Image = class Image
      constructor: ->
        setTimeout => @onload()
      onload: ->
      width: 120
      height: 90
    @article = fixtures().articles
    benv.setup =>
      benv.expose
        _: require('underscore')
        $: benv.require('jquery')
        jQuery: benv.require('jquery')
        sd: { ARTICLE: @article, CURRENT_CHANNEL: id: '456' }
      window.jQuery = jQuery
      @client = rewire '../client.coffee'
      @client.__set__ 'EditLayout', @EditLayout = sinon.stub()
      @client.__set__ 'EditHeader', @EditHeader = sinon.stub()
      @client.__set__ 'EditAdmin', @EditAdmin = sinon.stub()
      @client.__set__ 'EditDisplay', @EditDisplay = sinon.stub()
      @client.__set__ 'ReactDOM', @ReactDOM = render: sinon.stub()
      @client.__set__ 'sd', sd
      done()

  afterEach ->
    benv.teardown()

  it 'initializes Backbone layouts and React components', (done) ->
    @client.init()
    _.defer =>
      @EditLayout.callCount.should.equal 1
      @EditHeader.callCount.should.equal 1
      @EditAdmin.callCount.should.equal 1
      @ReactDOM.render.callCount.should.equal 2
      done()

  it 'converts images and artworks to ImageCollection', (done) ->
    @client.init()
    _.defer =>
      @client.article.sections.models[1].get('type').should.equal 'image_collection'
      @client.article.sections.models[1].get('layout').should.equal 'overflow_fillwidth'
      @client.article.sections.models[1].get('images')[0].type.should.equal 'image'
      @client.article.sections.models[1].get('images')[0].caption.should.equal 'This is a terrible caption'
      @client.article.sections.models[1].get('images')[0].url.should.equal 'http://gemini.herokuapp.com/123/miaart-banner.jpg'
      @client.article.sections.models[3].get('type').should.equal 'image_collection'
      @client.article.sections.models[3].get('layout').should.equal 'overflow_fillwidth'
      @client.article.sections.models[3].get('images')[0].image.should.equal 'https://artsy.net/artwork.jpg'
      @client.article.sections.models[3].get('images')[0].title.should.equal 'The Four Hedgehogs'
      @client.article.sections.models[3].get('images')[1].title.should.equal 'The Four Hedgehogs 2'
      @client.article.sections.models[3].get('images')[1].id.should.equal '5321b71c275b24bcaa0001a5'
      @client.article.sections.models[3].get('images')[1].image.should.equal 'https://artsy.net/artwork2.jpg'
      done()

  it 'keeps image sets as is', (done) ->
    @client.init()
    _.defer =>
      @client.article.sections.models[6].get('type').should.equal 'image_set'
      @client.article.sections.models[6].get('images')[0].image.should.equal 'https://artsy.net/artwork2.jpg'
      @client.article.sections.models[6].get('images')[0].title.should.equal 'The Four Hedgehogs 2'
      @client.article.sections.models[6].get('images')[1].type.should.equal 'image'
      @client.article.sections.models[6].get('images')[1].caption.should.equal 'This is a terrible caption'
      @client.article.sections.models[6].get('images')[1].url.should.equal 'http://gemini.herokuapp.com/123/miaart-banner.jpg'
      done()

  it 'makes sure images have widths and heights', (done) ->
    @client.init()
    _.defer =>
      @client.article.sections.models[3].get('images')[0].width.should.equal 120
      @client.article.sections.models[3].get('images')[0].height.should.equal 90
      @client.article.sections.models[3].get('images')[1].width.should.equal 120
      @client.article.sections.models[3].get('images')[1].height.should.equal 90
      @client.article.sections.models[6].get('images')[0].height.should.equal 90
      @client.article.sections.models[6].get('images')[0].height.should.equal 90
      @client.article.sections.models[6].get('images')[1].height.should.equal 90
      @client.article.sections.models[6].get('images')[1].height.should.equal 90
      done()

  it 'strips handle fields from authors', (done) ->
    @article.author = {
      id: '123'
      name: 'Artsy Editorial'
      profile_id: '123'
      profile_handle: 'Artsy'
      facebook_handle: 'fbhandle'
      twitter_handle: 'thandle'
    }
    @client.init()
    _.defer =>
      @client.article.get('author').should.eql {
        id: '123'
        name: 'Artsy Editorial'
      }
      done()