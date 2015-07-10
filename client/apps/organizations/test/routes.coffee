routes = require '../routes'
_ = require 'underscore'
Backbone = require 'backbone'
sinon = require 'sinon'
fixtures = require '../../../../test/helpers/fixtures'
User = require '../../../models/user'

describe 'routes', ->

  beforeEach ->
    sinon.stub Backbone, 'sync'
    @req = { query: {}, user: new User(fixtures().users), params: {} }
    @res = { render: sinon.stub(), locals: fixtures().locals }

  afterEach ->
    Backbone.sync.restore()

  describe '#save', ->

    it 'saves the serialized form data to the organization', ->
      @req.body =
        name: 'Foobar'
      routes.save @req, @res
      Backbone.sync.args[0][1].toJSON().name.should.equal 'Foobar'

  describe '#edit', ->

    it 'renders the edit page', ->
      routes.edit @req, @res
      Backbone.sync.args[0][2].success fixtures().organizations
      @res.render.args[0][0].should.equal 'edit'
      @res.render.args[0][1].organization.get('id')
        .should.equal '559ff9706b69f6a086a6563f'