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
        $.fn.autosize = sinon.stub()
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

  describe 'no #autosave on published article', ->

    it 'does not autosave on debounce keyup when editing a published article', ->
      @view.article.set { published: true }
      $('#edit-title textarea').trigger 'keyup'
      @view.changedAPublishedArticle.should.equal true

    it 'does not autosave on section changes when editing a published article', ->
      @view.article.set { published: true }
      @view.article.sections.trigger 'add'
      @view.changedAPublishedArticle.should.equal true

  describe '#serialize', ->

    it 'turns form elements into data', ->
      @view.$('#edit-thumbnail-title :input').val('foobar')
      @view.serialize().thumbnail_title.should.equal 'foobar'

    it 'adds the current user as the author for cases like impersonating' +
       ' which need that explicitly sent', ->
      @view.user.set id: 'foo'
      @view.serialize().author_id.should.equal 'foo'

    it 'adds tier', ->
      @view.$('[type=radio]').first().click()
      @view.serialize().tier.should.equal 1
      @view.$('[type=radio]').eq(1).click()
      @view.serialize().tier.should.equal 2

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
        "<div class='edit-section-container' data-editing='true'>
          <div class='edit-section-controls'></div>
        </div>"
      )
      @view.popLockControls()
      $($section.find('.edit-section-controls')).attr('data-fixed')
        .should.equal 'true'

  describe '#onFinished', ->

    it 'redirects to the list if the articles is saved', ->
      sinon.stub $.fn, 'ajaxStop'
      @view.redirectToList = sinon.stub()
      @view.onFinished()
      $.fn.ajaxStop.args[0][0]()
      @view.redirectToList.called.should.be.ok
      $.fn.ajaxStop.restore()

  describe '#onFirstSave', ->

    it 'updates the url', ->
      sinon.stub Backbone.history, 'navigate'
      @view.article.set id: 'foo'
      @view.onFirstSave()
      Backbone.history.navigate.args[0][0].should.equal '/articles/foo/edit'

  describe '#setupOnBeforeUnload', ->

    it 'stops you if theres ajax requests going on', ->
      $.active = 3
      @view.setupOnBeforeUnload()
      window.onbeforeunload().should.containEql 'not finished'

    it 'stops you if theres a published article that is not yet saved', ->
      $.active = 0
      @view.changedAPublishedArticle = true
      @view.finished = false
      @view.setupOnBeforeUnload()
      window.onbeforeunload().should.containEql 'do you wish to continue'