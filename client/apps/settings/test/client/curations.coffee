_ = require 'underscore'
benv = require 'benv'
sinon = require 'sinon'
Curation = require '../../../../models/curation'
Backbone = require 'backbone'
moment = require 'moment'
should = require 'should'
fixtures = require '../../../../../test/helpers/fixtures'
{ resolve } = require 'path'
rewire = require 'rewire'

describe 'EditCuration', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      Backbone.$ = $
      @curation = new Curation
        name: 'Artsy Editorial Feature'
        id: '1234'
        type: 'editorial-feature'
        sections: [{body: 'foo'}]
        carousel: []
        placeholder: ""
      locals = _.extend(_.clone(fixtures().locals),
        curation: @curation
      )
      tmpl = resolve __dirname, '../../templates/curations/curation_edit.jade'
      benv.render tmpl, locals, =>
        { @CurationEditView } = mod = benv.requireWithJadeify(
          resolve(__dirname, '../../client/curations'), []
        )
        mod.__set__ 'sd', {
          EF_VENICE: '4321'
        }
        mod.__set__ 'AdminEditView', sinon.stub()
        @view = new @CurationEditView el: $('body'), curation: @curation
        done()

  afterEach ->
    benv.teardown()

  describe '#initialize', ->

    it 'populates the form saved curation data', ->
      $('body textarea').html().should.containEql 'foo'

  describe '#initMenuState', ->

    it 'adds a sticky header menu class', ->
      $('.page-header').hasClass('sticky')


  describe '#revealSection', ->

    it 'adds dropdowns to each section', ->
      $('.settings-edit-feature__section').first().click()
      $('.settings-edit-feature__fields').first().hasClass 'active'