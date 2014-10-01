Browser = require "zombie"
integration = require "../../../test/helpers/integration"

describe "articles list", ->

  before (done) ->
    integration.startServer -> done()

  after ->
    integration.closeServer()

  it "shows an empty article", (done) ->
    Browser.visit "http://localhost:5000/articles/new", {
      headers: 'X-Access-Token': 'foo-token'
    }, (err, browser) ->
      browser.html().should.containEql "Type a title"
      done()