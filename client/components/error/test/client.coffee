Backbone = require 'backbone'
benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'

describe 'ErroModal', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: require 'jquery'
      Backbone.$ = $
      sinon.stub $, 'ajax'
      { ErrorModal } = mod = benv.requireWithJadeify(
        resolve(__dirname, '../index'), ['template']
      )
      mod.__set__ 'Modal', @Modal = ->
        m: $("<div></div>")
        close: ->
      @modal = new ErrorModal error: new Error "ERRR"
      done()

  afterEach ->
    $.ajax.restore()
    benv.teardown()

  it 'submits an error on form submission', ->
    @modal.submitReport preventDefault: ->
    $.ajax.args[0][0].url.should.containEql '/report'
    $.ajax.args[0][0].data.html.should.containEql 'ERRR'
