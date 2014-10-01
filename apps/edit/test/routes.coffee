routes = require '../routes'
_ = require 'underscore'
Backbone = require 'backbone'
{ spooky } = require '../../../lib/apis'
sinon = require 'sinon'
fixtures = require '../../../test/helpers/fixtures'

describe 'routes', ->

  beforeEach ->
    sinon.stub spooky, 'get'
    @req = { query: {} }
    @res = { render: sinon.stub(), locals: sd: {} }

  afterEach ->
    spooky.get.restore()

  describe '#create', ->

    it 'renders an empty article', ->
      routes.create @req, @res
      @res.render.args[0][0].should.equal 'index'
      @res.render.args[0][1].article.isNew().should.be.ok