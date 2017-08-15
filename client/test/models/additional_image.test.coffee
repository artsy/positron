_ = require 'underscore'
Backbone = require 'backbone'
AdditionalImage = require '../../models/additional_image.coffee'
AdditionalImages = require '../../collections/additional_images.coffee'
sinon = require 'sinon'
{ fabricate } = require 'antigravity'

describe "AdditionalImage", ->

  beforeEach ->
    sinon.stub Backbone, 'sync'
    @image = new AdditionalImages(fabricate('artwork').images).default()

  afterEach ->
    Backbone.sync.restore()
