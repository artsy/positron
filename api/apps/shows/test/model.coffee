require '../../../test/helpers/db'
_ = require 'underscore'
Show = require '../model'
gravityServer = require('antigravity').server
express = require 'express'
app = require('express')()


describe 'Show', ->

  before (done) ->
    app.use '/__gravity', gravityServer
    @server = app.listen 5000, ->
      done()

  after ->
    @server.close()

  describe '#find', ->

    it 'should proxy the show endpoint', (done) ->
      Show.find 'foo', 'foo-token', (err, show) ->
        show.name.should.equal 'Inez & Vinoodh'
        done()

  describe '#search', ->

    it 'joins various API endpoints into a simple search result', (done) ->
      Show.search 'foo', 'foo-token', (err, results) ->
        results[0].id.length.should.be.above 1
        results[0].value.should.equal 'Inez & Vinoodh'
        done()
