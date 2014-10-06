_ = require 'underscore'
{ db, fabricate, empty, fixtures } = require '../api/test/helpers/db'
Browser = require "zombie"
integration = require "./helpers/integration"

describe "articles list", ->

  before (done) ->
    integration.startServer -> done()

  after ->
    integration.closeServer()

  beforeEach (done) ->
    fabricate 'users', {}, (err, @user) =>
      fabricate 'articles', _.times(10, -> {}), (err, @articles) =>
        done()

  afterEach (done) ->
    empty -> done()

  it "displays a list of articles", (done) ->
    Browser.visit 'http://localhost:5000', (err, browser) =>
      browser.html().should.containEql @articles[0].title
      done()

  xit "shows an empty article", (done) ->
    Browser.visit "http://localhost:5000/articles/new", (err, browser) ->
      browser.html().should.containEql "Save Draft"
      done()