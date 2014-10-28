_ = require 'underscore'
benv = require 'benv'
sinon = require 'sinon'
Article = require '../../../../../models/article'
Backbone = require 'backbone'
fixtures = require '../../../../../../test/helpers/fixtures'
{ resolve } = require 'path'

describe 'EditLayout', ->

  beforeEach (done) ->
    benv.setup =>
      tmpl = resolve __dirname, '../index.jade'
      benv.render tmpl, _.extend(fixtures().locals,
        article: @article = new Article fixtures().article
      ), =>
        benv.expose $: require('jquery')
        Backbone.$ = $
        sinon.stub Backbone, 'sync'
        EditLayout = require '../index.coffee'
        sinon.stub _, 'debounce'
        _.debounce.callsArg 0
        @view = new EditLayout el: $('#layout-content'), article: @article
        @view.article.sync = sinon.stub()
        done()

  afterEach ->
    benv.teardown()
    Backbone.sync.restore()
    _.debounce.restore()

  describe '#toggleTabs', ->

    it 'highlights missing fields if the author isnt done', ->
      @view.highlightMissingFields = sinon.stub()
      $('#edit-publish').click()
      @view.highlightMissingFields.called.should.be.ok

  describe '#autosave', ->

    it 'autosaves on debounce keyup', ->
      $('#edit-title input').trigger 'keyup'
      Backbone.sync.called.should.be.ok

    it 'autosaves on section changes', ->
      @view.article.sections.trigger 'change'
      Backbone.sync.called.should.be.ok

  describe 'on destroy', ->

    it 'redirects to the root', ->
      location.assign = sinon.stub()
      @view.article.destroy()
      location.assign.args[0][0].should.containEql '/articles?published='

  describe '#serialize', ->

    it 'turns form elements into data', ->
      @view.$('#edit-lead-paragraph input').val('foobar')
      @view.serialize().lead_paragraph.should.equal 'foobar'

    it 'cleans up tags into an array', ->
      @view.$('#edit-thumbnail-tags input').val('foobar,baz,boo   bar,bam  ')
      @view.serialize().tags.should.eql [
        'foobar', 'baz', 'boo bar', 'bam'
      ]

  describe '#popLockControls', ->

    it 'locks the controls to the top when you scroll', ->
      @view.$window = scrollTop: -> 100
      @view.$el.append( $section = $
        "<div class='edit-section-container' data-state-editing='true'>
          <div class='edit-section-controls'></div>
        </div>"
      )
      @view.popLockControls()
      $($section.find('.edit-section-controls')).attr('data-fixed')
        .should.equal 'true'