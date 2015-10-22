Backbone = require 'backbone'
benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'

describe 'ErroModal', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      Backbone.$ = $
      sinon.stub $, 'ajax'
      { ErrorModal } = mod = benv.requireWithJadeify(
        resolve(__dirname, '../client'), ['template']
      )
      mod.__set__ 'Modal', @Modal = ->
        m: $("<div></div>")
        close: ->
      @modal = new ErrorModal error: new Error "ERRR"
      done()

  afterEach ->
    $.ajax.restore()
    benv.teardown()

  it 'opens intercom on report', ->
    spy = sinon.stub $.fn, 'click'
    @modal.openIntercom()
    spy.thisValues[0].selector.should.equal '#intercom-launcher'
