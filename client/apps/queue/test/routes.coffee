rewire = require 'rewire'
routes = rewire '../routes'
_ = require 'underscore'
sinon = require 'sinon'
fixtures = require '../../../../test/helpers/fixtures'
User = require '../../../models/user'

describe 'routes', ->

  beforeEach ->
    routes.__set__ 'Lokka', sinon.stub().returns(
      query: sinon.stub().returns
        then: sinon.stub().yields { articles: [fixtures().articles] }
    )
    @req = { query: {}, user: new User(fixtures().users), params: {} }
    @res = { render: sinon.stub(), locals: fixtures().locals }

  describe '#queue', ->

    it 'fetches the latest and queued', ->
      routes.queue @req, @res
      @res.locals.sd.QUEUED_ARTICLES.length.should.equal 1
      @res.locals.sd.PUBLISHED_ARTICLES.length.should.equal 1

    it 'sends arguments to the template', ->
      routes.queue @req, @res
      @res.render.args[0][0].should.equal 'index'
      @res.render.args[0][1].published.should.be.true()
      @res.render.args[0][1].current_channel.name.should.equal 'Editorial'
