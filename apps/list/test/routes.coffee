routes = require '../routes'
_ = require 'underscore'
Backbone = require 'backbone'
sinon = require 'sinon'
fixtures = require '../../../test/helpers/fixtures'

describe 'routes', ->

  beforeEach ->
    sinon.stub Backbone, 'sync'
    @req = {}
    @res = { render: sinon.stub(), locals: sd: {} }

  afterEach ->
    Backbone.sync.restore()

  describe '#index', ->

    it 'fetches a page of articles', ->
      routes.index @req, @res
      Backbone.sync.args[0][2].success fixtures.collection
      _.last(@res.render.args[0][1].articles).get('title')
        .should.containEql 'Art in'