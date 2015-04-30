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

  describe '#iconUrl', ->

    it 'gets the first image and fixes the url', ->
      @user.iconUrl().should.containEql 'square140.png'

    it 'gives a missing image if available', ->
      @user.set icon_urls: {}
      @user.iconUrl().should.containEql 'layout_missing_user'
