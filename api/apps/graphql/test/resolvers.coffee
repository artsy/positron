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
    resolvers.__set__ 'where', @where = sinon.stub().yields null, articles
    @req = user: channel_ids: ['456']

  describe 'articles', ->

    it 'returns throws error when trying to view a draft without channel_id', ->
      args = published: false
      (-> resolvers.articles({}, args, {}, {})).should.throw('Must pass channel_id to view unpublished articles. Or pass published: true to only view published articles.')

    it 'returns throws an error when trying to view an unauthorized draft', ->
      args = published: false, channel_id: '123'
      (-> resolvers.articles({}, args, {}, {})).should.throw('Must be a member of this channel to view unpublished articles. Pass published: true to only view published articles.')

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
