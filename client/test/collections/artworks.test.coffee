_ = require 'underscore'
Backbone = require 'backbone'
Artworks = require '../../collections/artworks.coffee'
sinon = require 'sinon'
fixtures = require '../../../test/helpers/fixtures'

describe "Article", ->

  beforeEach ->
    sinon.stub Backbone, 'sync'
    @artworks = new Artworks fixtures().artworks

  afterEach ->
    Backbone.sync.restore()