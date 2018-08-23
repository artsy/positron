# rewire = require 'rewire'
# websocket = require '../../websocket'
# routes = rewire '../routes'
# Backbone = require 'backbone'

# _ = require 'underscore'
# sinon = require 'sinon'
# fixtures = require '../../../../test/helpers/fixtures'
# User = require '../../../models/user'

# describe 'routes', ->

#   beforeEach ->
#     sinon.stub Backbone, 'sync'
#     routes.__set__ 'Lokka', sinon.stub().returns(
#       query: sinon.stub().returns
#         then: sinon.stub().yields({ articles: [fixtures().articles] }).returns
#           catch: sinon.stub().yields()
#     )

#     websocket.__Rewire__ 'sessions',
#       fetch: () ->
#         new Promise (resolve, reject) -> resolve(fixtures.sessions)

#     @req = { query: {}, user: new User(fixtures().users), params: {} }
#     @res = { render: sinon.stub(), locals: fixtures().locals }
#     @next = sinon.stub()
  
#   afterEach ->
#     Backbone.sync.restore()

#   describe '#articles_list', ->

#     it 'fetches articles', ->
#       routes.articles_list @req, @res, @next
#       @res.locals.sd.ARTICLES.length.should.equal 1

#     xit 'sends arguments to the template', ->
#       routes.articles_list @req, @res, @next
#       @res.render.args[0][0].should.equal 'index'
#       @res.render.args[0][1].current_channel.name.should.equal 'Editorial'

#     xit 'is aware of url queries', ->
#       routes.articles_list @req, @res, @next
#       @res.locals.sd.HAS_PUBLISHED.should.equal true

#       @req.query = { published: 'false' }
#       routes.articles_list @req, @res, @next
#       @res.locals.sd.HAS_PUBLISHED.should.equal false

#       @req.query = { published: 'true' }
#       routes.articles_list @req, @res, @next
#       @res.locals.sd.HAS_PUBLISHED.should.equal true