_ = require 'underscore'
Backbone = require 'backbone'
User = require '../../models/user'
sinon = require 'sinon'
fixtures = require '../../../test/helpers/fixtures'

describe "User", ->

  beforeEach ->
    sinon.stub Backbone, 'sync'
    @user = new User fixtures().users

  afterEach ->
    Backbone.sync.restore()
