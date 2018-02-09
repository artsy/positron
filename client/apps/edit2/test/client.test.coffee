benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
rewire = require 'rewire'
fixtures = require '../../../../test/helpers/fixtures'

xdescribe 'init', ->

  beforeEach (done) ->
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