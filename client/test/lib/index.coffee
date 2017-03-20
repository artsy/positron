sinon = require 'sinon'
rewire = require 'rewire'
setup = rewire '../../lib/setup/index'
express = require 'express'

describe 'index', ->

  beforeEach ->
    setup.__set__
      setupAuth: @setupAuth = sinon.stub()
      setupEnv: @setupEnv = sinon.stub()
      session: @session = sinon.stub().returns((req, res, next) -> next())
      morgan: @morgan = sinon.stub().returns((req, res, next) -> next())
      bodyParser:
        json: @json = sinon.stub().returns((req, res, next) -> next())
        urlencoded: @urlencoded = sinon.stub().returns((req, res, next) -> next())
      bucketAssets: @bucketAssets = sinon.stub().returns((req, res, next) -> next())
    @app = express()
    sinon.spy @app, 'use'
    sinon.spy @app, 'get'
    sinon.spy @app, 'set'
    setup @app

  it 'sets up a /system/up route', ->
    @app.get.args[0][0].should.equal '/system/up'

  it 'mounts generic middleware', ->
    @setupEnv.called.should.be.true()
    @app.use.args[1][0].name.should.containEql 'cookieParser'
    @json.args[0][0].limit.should.equal '5mb'
    @json.args[0][0].extended.should.be.true()
    @urlencoded.args[0][0].limit.should.equal '5mb'
    @urlencoded.args[0][0].extended.should.be.true()
    @morgan.args[0][0].should.equal 'tiny'
    @bucketAssets.called.should.be.true()
    @setupAuth.called.should.be.true()

describe 'development environment', ->

  beforeEach ->
    setup.__set__
      NODE_ENV: 'development'
      setupAuth: @setupAuth = sinon.stub()
      setupEnv: @setupEnv = sinon.stub()
      session: @session = sinon.stub().returns((req, res, next) -> next())
      morgan: @morgan = sinon.stub().returns((req, res, next) -> next())
    @app = express()
    sinon.spy @app, 'use'
    sinon.spy @app, 'get'
    sinon.spy @app, 'set'
    setup @app

  it 'sets morgan logs to dev mode', ->
    @morgan.args[0][0].should.equal 'dev'

describe 'production environment', ->

  beforeEach ->
    setup.__set__
      NODE_ENV: 'production'
      setupAuth: @setupAuth = sinon.stub()
      setupEnv: @setupEnv = sinon.stub()
      session: @session = sinon.stub().returns((req, res, next) -> next())
      morgan: @morgan = sinon.stub().returns((req, res, next) -> next())
    @app = express()
    sinon.spy @app, 'use'
    sinon.spy @app, 'get'
    sinon.spy @app, 'set'
    setup @app

  it 'sets morgan logs to tiny mode', ->
    @morgan.args[0][0].should.equal 'tiny'

  it 'sets SSL options', ->
    @app.set.args[3][0].should.equal 'forceSSLOptions'
    @app.set.args[3][1].trustXFPHeader.should.be.true()