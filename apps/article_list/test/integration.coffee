return # TODO: Figure out what's up with Semaphore timing out

Browser = require "zombie"
integration = require "../../../test/helpers/integration"

describe "articles list", ->

  before (done) ->
    integration.startServer -> done()

  after ->
    integration.closeServer()

  it "displays a list of articles", (done) ->
    Browser.visit "http://localhost:5000", (err, browser) ->
      browser.html().should.containEql "The art in Copenhagen is soo over"
      done()