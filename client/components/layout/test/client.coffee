Backbone = require 'backbone'
benv = require 'benv'
sinon = require 'sinon'
fixtures = require '../../../../test/helpers/fixtures'
User = require '../../../models/user.coffee'
rewire = require 'rewire'

describe '#init', ->

  before (done) ->
    benv.setup =>
      benv.expose
        _: require('underscore')
        $: benv.require('jquery')
        jQuery: benv.require('jquery')
      window.jQuery = jQuery
      window.location.replace = sinon.stub()
      Backbone.history.start = sinon.stub()
      @client = rewire '../client.coffee'
      @client.__set__ 'sd', { USER: fixtures().users }
      @client.__set__ 'AutocompleteChannels', (@autocomplete = sinon.stub())
      sinon.stub(User.prototype, 'isOutdated').yields false
      sinon.stub(User.prototype, 'refresh').yields()
      done()

  after: ->
    Backbone.history.start.restore()
    User.prototype.isOutdated.restore()
    User.prototype.refresh.restore()
    window.location.replace.restore()
    benv.teardown()

  it 'initializes AutocompleteChannels view when clicking into "Switch Channels"', ->
    @client.init()
    $('#layout-sidebar-switch-channel').click()
    _.defer =>
      @autocomplete.calledOnce.should.be.true()

  it 'toggles the hamburger menu', ->
    @client.init()
    $('#layout-hamburger-container').click()
    _.defer =>
      $('#layout-sidebar-container').hasClass('is-active').should.be.true()

  it 'ensures a fresh user - does not logout if isnt outdated', ->
    User.prototype.isOutdated.restore()
    sinon.stub(User.prototype, 'isOutdated').yields false
    @client.init()
    User.prototype.refresh.calledOnce.should.be.false()

  it 'ensures a fresh user -- logs out if outdated', ->
    User.prototype.isOutdated.restore()
    sinon.stub(User.prototype, 'isOutdated').yields true
    @client.init()
    User.prototype.refresh.calledOnce.should.be.true()
