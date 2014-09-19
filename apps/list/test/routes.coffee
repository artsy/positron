routes = require '../routes'
_ = require 'underscore'
Backbone = require 'backbone'
spooky = require '../../../lib/spooky_fetcher'
sinon = require 'sinon'
fixtures = require '../../../test/helpers/fixtures'

describe 'routes', ->

  beforeEach ->
    sinon.stub spooky, 'new'
    @req = {}
    @res = { render: sinon.stub(), locals: sd: {} }

  afterEach ->
    spooky.new.restore()

  describe '#index', ->

    it 'fetches a page of articles', ->
      routes.index @req, @res
      _.last(spooky.new.args[0])(null, new Backbone.Collection [fixtures.article])
      _.last(@res.render.args[0][1].articles).get('title')
        .should.containEql 'art in'