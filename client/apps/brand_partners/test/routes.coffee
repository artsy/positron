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

    it 'saves the serialized form data to the brand partner', ->
      @req.body =
        partner_id: '5086df098523e60002000018'
        featured_links: [{ headline: 'foo' }, { headline: 'bar' }, null, '']
      routes.save @req, @res
      Backbone.sync.args[0][1].toJSON().partner_id.should.equal '5086df098523e60002000018'
      Backbone.sync.args[0][1].toJSON().featured_links.length
        .should.equal 2
      Backbone.sync.args[0][1].toJSON().featured_links[0].headline.should.equal 'foo'

    it 'does not save featured links which are empty', ->
      @req.body =
        featured_links: [{ headline: '' }, { headline: 'bar' }, null, '']
      routes.save @req, @res
      Backbone.sync.args[0][1].toJSON().featured_links.length
        .should.equal 1
      Backbone.sync.args[0][1].toJSON().featured_links[0].headline.should.equal 'bar'

  describe '#edit', ->

    it 'renders the edit page', ->
      routes.edit @req, @res
      Backbone.sync.args[0][2].success fixtures().brandPartners
      @res.render.args[0][0].should.equal 'edit'
      @res.render.args[0][1].brandPartner.get('id')
        .should.equal '559ff9706b69f6a086a65633'