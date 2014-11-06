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
        @EditLayout = require '../index.coffee'
        sinon.stub @EditLayout.prototype, 'attachScribe'
        sinon.stub _, 'debounce'
        _.debounce.callsArg 0
        @view = new @EditLayout el: $('#layout-content'), article: @article
        @view.article.sync = sinon.stub()
        done()

  afterEach ->
    benv.teardown()
    Backbone.sync.restore()
    _.debounce.restore()
    @EditLayout::attachScribe.restore()

  describe '#autosave', ->

    it 'autosaves on debounce keyup', ->
      $('#edit-title textarea').trigger 'keyup'
      Backbone.sync.called.should.be.ok

    it 'autosaves on section changes', ->
      @view.article.sections.trigger 'change'
      Backbone.sync.called.should.be.ok

  describe '#serialize', ->

    it 'turns form elements into data', ->
      @view.$('#edit-thumbnail-title :input').val('foobar')
      @view.serialize().thumbnail_title.should.equal 'foobar'

    it 'cleans up tags into an array', ->
      @view.$('#edit-thumbnail-tags input').val('foobar,baz,boo   bar,bam  ')
      @view.serialize().tags.should.eql [
        'foobar', 'baz', 'boo bar', 'bam'
      ]

  describe '#attachScribe', ->

    it 'attaches Scribe to the lead paragraph'

  describe '#toggleLeadParagraphPlaceholder', ->

    it 'toggle the placeholder ::before element if lead paragraph is empty', ->
      $('#edit-lead-paragraph').html "<p>foobar</p>"
      @view.toggleLeadParagraphPlaceholder()
      $('#edit-lead-paragraph').hasClass('is-empty').should.not.be.ok
      $('#edit-lead-paragraph').html "<p><br></p>"
      @view.toggleLeadParagraphPlaceholder()
      $('#edit-lead-paragraph').hasClass('is-empty').should.be.ok

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

  describe '#onFinished', ->

    it 'redirects to the list once the articles syncs', ->
      @view.redirectToList = sinon.stub()
      @view.onFinished()
      @view.article.trigger 'sync'
      @view.redirectToList.called.should.be.ok

  describe '#syncTitleTeaser', ->

    it 'adds a title and teaser to an empty post', ->
      @view.article.set thumbnail_title: '', thumbnail_teaser: ''
      @view.$('#edit-title textarea').val 'foo'
      @view.$('#edit-lead-paragraph').html '<p>bar</p>'
      @view.syncTitleTeaser()
      @view.serialize().thumbnail_title.should.equal 'foo'
      @view.serialize().thumbnail_teaser.should.equal 'bar'

    it 'doesnt change filled in posts', ->
      @view.article.set thumbnail_title: 'moo', thumbnail_teaser: 'baz'
      @view.$('#edit-thumbnail-title input').val 'moo'
      @view.$('#edit-thumbnail-teaser textarea').val 'baz'
      @view.$('#edit-title textarea').val 'foo'
      @view.$('#edit-lead-paragraph').html '<p>bar</p>'
      @view.syncTitleTeaser()
      @view.serialize().thumbnail_title.should.equal 'moo'
      @view.serialize().thumbnail_teaser.should.equal 'baz'

  describe '#onFirstSave', ->

    it 'updates the url', ->