_ = require 'underscore'
Backbone = require 'backbone'
CurrentUser = require '../../models/current_user'
sinon = require 'sinon'
fixtures = require '../../../test/helpers/fixtures'

describe "CurrentUser", ->

  beforeEach ->
    sinon.stub Backbone, 'sync'
    @user = new CurrentUser fixtures().users

  afterEach ->
    Backbone.sync.restore()

  describe '#iconUrl', ->

    it 'gets the first image and fixes the url', ->
      @user.iconUrl().should.containEql 'square140.png'