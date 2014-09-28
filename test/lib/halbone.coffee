return # TODO: Figure out what's up with Semaphore timing out

rewire = require 'rewire'
Backbone = require 'backbone'
halbone = rewire '../../lib/halbone'
integration = require "../helpers/integration"

describe 'halbone', ->

  before (done) ->
    @api = halbone 'http://localhost:5000/__spooky'
    integration.startServer -> done()

  after ->
    integration.closeServer()

  it 'crawls links and creates models from the API data like a BOSS', (done) ->
    @api.new Backbone.Collection, 'articles.articles', (err, articles) ->
      articles.first().get('title').should.equal 'The art in Copenhagen is soo over'
      done()