_ = require 'underscore'
benv = require 'benv'
sinon = require 'sinon'
Article = require '../../../../../models/article'
Channel = require '../../../../../models/channel'
Backbone = require 'backbone'
fixtures = require '../../../../../../test/helpers/fixtures'
rewire = require 'rewire'
{ resolve } = require 'path'

describe 'EditLayout', ->

  beforeEach (done) ->
    benv.setup =>
      tmpl = resolve __dirname, '../index.jade'
      sd = _.extend fixtures().locals.sd,
        CURRENT_CHANNEL: @channel = new Channel fixtures().channels
      locals = _.extend fixtures().locals,
        article: @article = new Article fixtures().articles
        sd: sd
      benv.render tmpl, locals, =>
        benv.expose $: benv.require('jquery')
        Backbone.$ = $
        sinon.stub Backbone, 'sync'
        sinon.stub Backbone.history, 'navigate'
        @EditLayout = rewire '../index.coffee'
        sinon.stub @EditLayout.prototype, 'attachScribe'
        @EditLayout.__set__ 'YoastView', @YoastView = sinon.stub().returns onKeyup: @yoastKeyup = sinon.stub()
        sinon.stub _, 'debounce'
        $.fn.autosize = sinon.stub()
        _.debounce.callsArg 0
        @view = new @EditLayout
          el: $('#layout-content')
          article: @article
          channel: @channel
        @view.article.sync = sinon.stub()
        done()

  afterEach ->
    benv.teardown()
    Backbone.sync.restore()
    Backbone.history.navigate.restore()
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
      @view.changedSection.should.equal true

    it 'does not autosave on section changes when editing a published article', ->
      @view.article.set { published: true }
      @view.article.sections.trigger 'add'
      @view.changedSection.should.equal true

  describe '#serialize', ->

    it 'turns form elements into data', ->
      @view.$('.edit-title-textarea').val('foobar')
      @view.$('#edit-admin-tags :input').val('house, couch')
      @view.$('#edit-admin-change-author input').val('Jon Snow')
      @view.serialize().thumbnail_title.should.equal 'foobar'
      @view.serialize().tags[0].should.equal 'house'
      @view.serialize().tags[1].should.equal 'couch'
      @view.serialize().author.name.should.equal 'Jon Snow'

    it 'adds the current user as the author_id', ->
      @view.user.set id: 'foo'
      @view.serialize().author_id.should.equal 'foo'

    it 'adds tier', ->
      @view.$('[type=radio]').first().click()
      @view.serialize().tier.should.equal 1
      @view.$('[type=radio]').eq(1).click()
      @view.serialize().tier.should.equal 2

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
      @view.changedSection = true
      @view.finished = false
      @view.setupOnBeforeUnload()
      window.onbeforeunload().should.containEql 'do you wish to continue'

  describe '#getBodyText', ->

    it 'parses the article and pulls out an html string of its text', ->
      text = @view.getBodyText()
      text.should.containEql '<p>Just before the lines'
      text.should.containEql 'Check out this video art:</p>'

  describe '#onYoastKeyup', ->

    it 'calls onKeyup on the yoast view', ->
      @view.onYoastKeyup()
      @yoastKeyup.callCount.should.equal 1

  describe '#setupYoast', ->

    it 'initializes YoastView with args', ->
      @YoastView.args[0][0].contentField.should.containEql 'Just before the lines start forming...'
      @YoastView.args[0][0].contentField.should.containEql 'Check out this video art'
