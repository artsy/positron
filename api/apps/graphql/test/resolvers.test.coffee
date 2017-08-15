_ = require 'underscore'
{ db, fixtures, fabricate, empty } = require '../../../test/helpers/db'
app = require '../../../'
rewire = require 'rewire'
resolvers = rewire '../resolvers.coffee'
sinon = require 'sinon'

describe 'resolvers', ->

  beforeEach (done) ->
    empty =>
      fabricate 'users', {channel_ids: ['456']}, (err, @user) =>
        @server = app.listen 5000, ->
          done()

  afterEach ->
    @server.close()

  beforeEach ->
    articles = total: 20, count: 1, results: [_.extend fixtures().articles, {slugs: ['slug-1']} ]
    @article = _.extend {}, fixtures().articles,
      slugs: ['slug-2']
      channel_id: '456'
    curations = total: 20, count: 1, results: [fixtures().curations]
    channels = total: 20, count: 1, results: [fixtures().channels]
    tags = total: 20, count: 1, results: [fixtures().tags]
    authors = total: 20, count: 1, results: [fixtures().authors]
    resolvers.__set__ 'mongoFetch', @mongoFetch = sinon.stub().yields null, articles
    resolvers.__set__ 'Curation', { mongoFetch: @curationWhere = sinon.stub().yields null, curations }
    resolvers.__set__ 'Channel', { mongoFetch: @channelWhere = sinon.stub().yields null, channels }
    resolvers.__set__ 'Tag', { mongoFetch: @tagWhere = sinon.stub().yields null, tags }
    resolvers.__set__ 'Author', { mongoFetch: @authorWhere = sinon.stub().yields null, authors }
    @req = user: channel_ids: ['456']

  describe 'articles', ->

    it 'returns throws error when trying to view a draft without channel_id', ->
      args = published: false
      resolvers.articles.bind({}, args, {}, {}).should.throw()

    it 'returns throws an error when trying to view an unauthorized draft', ->
      args = published: false, channel_id: '123'
      resolvers.articles.bind({}, args, {}, {}).should.throw()

    it 'can view drafts', ->
      args = published: false, channel_id: '456'
      resolvers.articles {}, args, @req, {}
      .then (results) =>
        results.length.should.equal 1
        results[0].slug.should.equal 'slug-1'

    it 'can view published articles', ->
      args = published: true
      resolvers.articles {}, args, @req, {}
      .then (results) =>
        results.length.should.equal 1
        results[0].slug.should.equal 'slug-1'

  describe 'article', ->

    it 'rejects with an error when no article is found', ->
      args = id: '123'
      resolvers.__set__ 'find', @find = sinon.stub().yields null, null
      resolvers.article {}, args, {}, {}
      .catch (err) ->
        err.toString().should.containEql 'Article not found.'

    it 'rejects with an error when trying to view an unauthorized draft', ->
      args = id: '123'
      article = _.extend {}, @article, channel_id: '000', published: false
      resolvers.__set__ 'find', @find = sinon.stub().yields null, article
      resolvers.article {}, args, {}, {}
      .catch (err) ->
        err.toString().should.containEql 'Must be a member of the channel'

    it 'can view drafts', ->
      args = id: '123'
      article = _.extend {}, @article, published: false
      resolvers.__set__ 'find', @find = sinon.stub().yields null, article
      resolvers.article {}, args, @req, {}
      .then (results) =>
        results.slug.should.equal 'slug-2'

    it 'can view published articles', ->
      args = id: '123'
      resolvers.__set__ 'find', @find = sinon.stub().yields null, @article
      resolvers.article {}, args, @req, {}
      .then (results) =>
        results.slug.should.equal 'slug-2'

  describe 'channels', ->

    it 'can find channels', ->
      resolvers.channels {}, {}, @req, {}
      .then (results) ->
        results.length.should.equal 1
        results[0].name.should.equal 'Editorial'
        results[0].type.should.equal 'editorial'

  describe 'curations', ->

    it 'can find curations', ->
      resolvers.curations {}, {}, @req, {}
      .then (results) ->
        results.length.should.equal 1
        results[0].name.should.equal 'Featured Articles'

  describe 'tags', ->

    it 'can find tags', ->
      resolvers.tags {}, {}, @req, {}
      .then (results) ->
        results.length.should.equal 1
        results[0].name.should.equal 'Show Reviews'

  describe 'authors', ->

    it 'can find authors', ->
      resolvers.authors {}, {}, @req, {}
      .then (results) ->
        results.length.should.equal 1
        results[0].name.should.equal 'Halley Johnson'
        results[0].bio.should.equal 'Writer based in NYC'
        results[0].twitter_handle.should.equal 'kanaabe'
        results[0].image_url.should.equal 'https://artsy-media.net/halley.jpg'
