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

    it 'saves the serialized form data to the curation', ->
      @req.body =
        name: 'Foobar'
        type: 'foobar-type'
        images: [{ src: 'foo' }, { src: 'bar' }]
      routes.save @req, @res
      Backbone.sync.args[0][1].toJSON().name.should.equal 'Foobar'
      Backbone.sync.args[0][1].toJSON().images.length
        .should.equal 2
      Backbone.sync.args[0][1].toJSON().images[0].src.should.equal 'foo'

  describe '#edit', ->

    it 'renders the edit page', ->
      routes.edit @req, @res
      Backbone.sync.args[0][2].success fixtures().curations
      @res.render.args[0][0].should.equal 'edit'
      @res.render.args[0][1].curation.get('id')
        .should.equal '55356a9deca560a0137aa4b7'
