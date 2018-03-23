_ = require 'underscore'
Backbone = require 'backbone'
AdditionalImages = require '../../collections/additional_images.coffee'
sinon = require 'sinon'
{ fabricate } = require 'antigravity'

describe "AdditionalImages", ->

  beforeEach ->
    sinon.stub Backbone, 'sync'
    @images = new AdditionalImages fabricate('artwork').images

  afterEach ->
    Backbone.sync.restore()

  describe '#default', ->

    it 'returns the default image', ->
      @images.default().get('is_default').should.be.true()
