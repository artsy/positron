routes = require '../routes'
_ = require 'underscore'
Backbone = require 'backbone'
sinon = require 'sinon'
fixtures = require '../../../../test/helpers/fixtures'
CurrentUser = require '../../../models/current_user'

describe 'routes', ->

  beforeEach ->
    sinon.stub Backbone, 'sync'
    @req = { query: {}, user: new CurrentUser fixtures().users }
    @res = { render: sinon.stub(), locals: fixtures().locals }

  afterEach ->
    Backbone.sync.restore()

  describe '#index', ->

    it 'fetches some users', ->
      routes.index @req, @res
      Backbone.sync.args[0][2].success {
        results: [_.extend(fixtures().users, name: "Marina")]
      }
      @res.render.args[0][1].users[0].get('name').should.equal 'Marina'