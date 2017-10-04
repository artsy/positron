_ = require 'underscore'
benv = require 'benv'
sinon = require 'sinon'
Article = require '../../../../../models/article'
Channel = require '../../../../../models/channel'
Sections = require '../../../../../collections/sections'
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
        USER: accessToken: 'foo'
      locals = _.extend fixtures().locals,
        article: @article = new Article fixtures().articles
        sd: sd
      benv.render tmpl, locals, =>
        benv.expose $: benv.require('jquery')
        Backbone.$ = $
        sinon.stub Backbone, 'sync'
        sinon.stub Backbone.history, 'navigate'
        @EditLayout = rewire '../index.coffee'
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

  describe '#autosave', ->

    it 'autosaves on from the content section on debounce keyup', ->
      $('#edit-title textarea').trigger 'keyup'
      Backbone.sync.called.should.be.ok

    it 'autosaves on from the display section on debounce keyup', ->
      $('.edit-display__textarea').trigger 'keyup'
      Backbone.sync.called.should.be.ok

    it 'autosaves on section changes', ->
      @view.article.sections.trigger 'change'
      Backbone.sync.called.should.be.ok

  describe 'no #autosave on published article', ->

    it 'does not autosave on debounce keyup when editing a published article', ->
      @view.article.set { published: true }
      $('input[name="credit_line"]').trigger 'keyup'
      @view.changedSection.should.equal true

    it 'does not autosave on section changes when editing a published article', ->
      @view.article.set { published: true }
      @view.article.sections.trigger 'add'
      @view.changedSection.should.equal true

  describe '#serialize', ->

    it 'turns form elements into data', ->
      @view.$('.edit-title-textarea').val('foobar')
      @view.serialize().thumbnail_title.should.equal 'foobar'

    it 'adds the current user as the author_id', ->
      @view.user.set id: 'foo'
      @view.serialize().author_id.should.equal 'foo'

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

    it 'returns if its not an editorial channel', ->
      @view.channel.set 'type', 'team'
      @view.onYoastKeyup()
      @yoastKeyup.callCount.should.equal 0

    it 'calls onKeyup on the yoast view', ->
      @view.onYoastKeyup()
      @yoastKeyup.callCount.should.equal 1

  describe '#setupYoast', ->

    it 'initializes YoastView with args', ->
      @YoastView.args[0][0].contentField.should.containEql 'Just before the lines start forming...'
      @YoastView.args[0][0].contentField.should.containEql 'Check out this video art'

  describe '#getLinkableText', ->
    it 'returns an array of linkable text', ->
      @view.article.sections = new Sections [
        {
          body: "<p>==Alice== was ==brave==</p>"
          type: "text"
        },
        {
          body: "<p>==Andy== was a ==pop== artist</p>"
          type: "text"
        }
      ]
      linkableText = @view.getLinkableText()
      linkableText.length.should.equal 4

  describe '#autolinkText', ->
    it 'creates links from search', ->
      request =
        get: sinon.stub().returns
          set: sinon.stub().returns
            end: @requestEnd = sinon.stub().yields(null, {
              body:
                total: 1
                hits: [
                  {
                    _type: 'artist'
                    _score: 9,
                    _source:
                      visible_to_public: true
                      name: 'Cat'
                      slug: 'cat'
                  },
                ]
            })
      @EditLayout.__set__ 'request', request
      view = new @EditLayout
        el: $('#layout-content')
        article: @article
        channel: @channel
      view.article.sections = new Sections [
        {
          body: "<p>==Alice== was ==brave==</p>"
          type: "text"
        }
      ]
      view.autolinkText()
      view.article.sections.first().get('body').should.equal "<p><a href='https://artsy.net/artist/cat'>Cat</a> was <a href='https://artsy.net/artist/cat'>Cat</a></p>"

    it 'removes delims if no good result is found', ->
      request =
        get: sinon.stub().returns
          set: sinon.stub().returns
            end: @requestEnd = sinon.stub().yields(null, {
              body:
                total: 0
            })
      @EditLayout.__set__ 'request', request
      view = new @EditLayout
        el: $('#layout-content')
        article: @article
        channel: @channel
      view.article.sections = new Sections [
        {
          body: "<p>==Alice== was ==brave==</p>"
          type: "text"
        }
      ]
      view.autolinkText()
      view.article.sections.first().get('body').should.equal "<p>Alice was brave</p>"

  describe '#findValidResults', ->
    it 'rejects scores less than 6.5', ->
      hits = [
        {_score: 1, _source: visible_to_public: true},
        {_score: 2, _source: visible_to_public: true},
        {_score: 9, _source: visible_to_public: true}
      ]
      @view.findValidResults(hits).length.should.equal 1

    it 'rejects hits that are not visible to the public', ->
      hits = [
        {_score: 9, _source: visible_to_public: true},
        {_score: 9, _source: visible_to_public: true},
        {_score: 9, _source: visible_to_public: false}
      ]
      @view.findValidResults(hits).length.should.equal 2

  describe '#getNewLinkFromHits', ->
    it 'returns a new link for artist type', ->
      results = [
        _source:
          name: 'Cat'
          slug: 'cat'
        _type: 'artist'
      ]
      @view.getNewLinkFromHits(results).should.equal "<a href='https://artsy.net/artist/cat'>Cat</a>"

    it 'returns a new link for partner type', ->
      results = [
        _source:
          name: 'Cat'
          slug: 'cat'
        _type: 'partner'
      ]
      @view.getNewLinkFromHits(results).should.equal "<a href='https://artsy.net/cat'>Cat</a>"

    it 'returns a new link for city type', ->
      results = [
        _source:
          name: 'Cat'
          slug: 'cat'
        _type: 'city'
      ]
      @view.getNewLinkFromHits(results).should.equal "<a href='https://artsy.net/shows/cat'>Cat</a>"
