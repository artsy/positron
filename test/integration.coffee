_ = require 'underscore'
{ db, fabricate, empty, fixtures } = require '../api/test/helpers/db'
Browser = require "zombie"
integration = require "./helpers/integration"

describe "Positron", ->

  before (done) ->
    integration.startServer -> done()

  after ->
    integration.closeServer()

  beforeEach (done) ->
    fabricate 'users', {}, (err, @user) =>
      fabricate 'articles', _.times(10, => { author_id: @user._id }), (err, @articles) =>
        Browser.visit "http://localhost:5000/login", (err, @browser) =>
          done()

  afterEach (done) ->
    empty -> done()

  it "displays a list of articles", (done) ->
    @browser.visit 'http://localhost:5000/articles?published=true', =>
      @browser.html().should.containEql @articles[0].thumbnail_title
      done()

  it "shows an empty article", (done) ->
    @browser.visit "http://localhost:5000/articles/new", =>
      @browser.html().should.containEql "Save Draft"
      done()

  xit "can add new text sections", (done) ->
    @browser.visit "http://localhost:5000/articles/new", =>
      @browser.wait =>
        $ = @browser.window.$
        $('.edit-menu-icon-text').click()
        $('.edit-section-text-editable').html("<p>Hi</p>")
        $('.edit-section-text-editing-bg').click()
        @browser.window.alert = ->
        $('#edit-save').click()
        @browser.wait =>
          db.articles.find().toArray (err, articles) ->
            done()
