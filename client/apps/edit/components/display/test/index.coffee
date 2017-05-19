_ = require 'underscore'
benv = require 'benv'
sinon = require 'sinon'
Article = require '../../../../../models/article'
Channel = require '../../../../../models/channel'
Backbone = require 'backbone'
fixtures = require '../../../../../../test/helpers/fixtures'
{ resolve } = require 'path'

describe 'EditDisplay', ->

  beforeEach (done) ->
    benv.setup =>
      tmpl = resolve __dirname, '../index.jade'
      benv.render tmpl, _.extend(fixtures().locals,
        article: @article = new Article fixtures().articles
        sd: CURRENT_CHANNEL: (@channel = new Channel fixtures().channels)
      ), =>
        benv.expose $: benv.require('jquery'), resize: ((url) -> url)
        Backbone.$ = $
        sinon.stub Backbone, 'sync'
        EditDisplay = benv.requireWithJadeify(
          resolve(__dirname, '../index')
          ['displayFormTemplate', 'magazinePreview', 'socialPreview', 'searchPreview', 'emailPreview']
        )
        EditDisplay.__set__ 'gemup', @gemup = sinon.stub()
        EditDisplay.__set__ 'crop', sinon.stub().returns('http://foo')
        EditDisplay.__set__ 'ImageUploadForm', @ImageUploadForm = sinon.stub()
        @view = new EditDisplay el: $('#edit-display'), article: @article
        done()

  afterEach ->
    benv.teardown()
    Backbone.sync.restore()

  describe '#useArticleTitle', ->

    it 'uses the article title when clicked', ->
      @view.article.set title: 'foo'
      @view.$('.edit-display__use-article-title').click()
      @view.$('.edit-display--magazine .edit-display__headline textarea').val().should.equal 'foo'

  describe '#checkTitleInput', ->

    it 'shows the use-title link when nothing is in the textarea', ->
      @view.$('.edit-display--magazine .edit-display__headline textarea').val('')
      @view.checkTitleInput()
      @view.$('.edit-display__use-article-title').css('display').should.equal 'block'

    it 'hides the use-title link when the title equals the textarea', ->
      @view.article.set title: 'foo'
      @view.$('.edit-display--magazine .edit-display__headline textarea').val('foo')
      @view.checkTitleInput()
      @view.$('.edit-display__use-article-title').attr('style').should.containEql 'display: none'

  describe '#renderThumbnailForms', ->

    it 'uses dist channel images when present', ->
      @article.set 'social_image', 'http://socialimage'
      @article.set 'email_metadata', { image_url: 'http://emailimage' }
      @view.renderThumbnailForms()
      @ImageUploadForm.args[4][0].src.should.equal 'http://kitten.com'
      @ImageUploadForm.args[5][0].src.should.equal 'http://socialimage'
      @ImageUploadForm.args[6][0].src.should.equal 'http://emailimage'

  describe '#onKeyup', ->

    beforeEach ->
      @view.renderPreviews = sinon.stub()
      @view.updateCharCount = sinon.stub()

    afterEach ->
      @view.renderPreviews.reset()
      @view.updateCharCount.reset()

    it 'calls renderPreviews and updateCharCount on textarea changes', ->
      input = @view.$('.edit-display--magazine .edit-display__headline textarea')
      input.trigger 'keyup'
      @view.renderPreviews.callCount.should.equal 1
      @view.updateCharCount.callCount.should.equal 1

    it 'calls renderPreviews and updateCharCount on author change', ->
      input = @view.$('.edit-display__author')
      input.trigger 'keyup'
      @view.renderPreviews.callCount.should.equal 1
      @view.updateCharCount.callCount.should.equal 1

    it 'does not renderPreviews on the initial load', ->
      input = @view.$('.edit-display--magazine .edit-display__headline textarea')
      input.trigger 'keyup', true
      @view.renderPreviews.callCount.should.equal 0

  describe '#updateCharCount', ->

    it 'updates the count when adding text', ->
      input = @view.$('.edit-display--magazine .edit-display__headline textarea')
      input.val('Title')
      input.trigger 'keyup', true
      @view.$('.edit-display--magazine .edit-char-count').text().should.containEql '92'

  describe '#sendBody', ->

    it 'updates article.send_body when clicked', ->
      @view.$('.admin-send-body-to-sailthru .flat-checkbox').click()
      @article.get('send_body').should.eql true

  describe '#renderPreviews', ->

    it 'rerenders the previews when inputs are changed', ->
      input = @view.$('.edit-display--magazine .edit-display__headline textarea')
      input.val('Title')
      input.trigger 'keyup'
      @view.$('.edit-display__prev-mag--headline').text().should.equal 'Title'

    it 'does not override when certain previews are present', ->
      input = @view.$('.edit-display--magazine .edit-display__headline textarea')
      input.val('Do not override')
      @view.$('.edit-display__prev-social--headline').text().should.equal 'Social Title'

describe 'EditDisplay Partner', ->

  beforeEach (done) ->
    benv.setup =>
      tmpl = resolve __dirname, '../index.jade'
      benv.render tmpl, _.extend(fixtures().locals,
        article: @article = new Article fixtures().articles
        sd: CURRENT_CHANNEL: new Channel _.extend fixtures().channels, type: 'partner'
      ), =>
        benv.expose $: benv.require('jquery'), resize: ((url) -> url)
        Backbone.$ = $
        sinon.stub Backbone, 'sync'
        EditDisplay = benv.requireWithJadeify(
          resolve(__dirname, '../index')
          ['displayFormTemplate', 'magazinePreview', 'socialPreview', 'searchPreview', 'emailPreview']
        )
        EditDisplay.__set__ 'gemup', @gemup = sinon.stub()
        EditDisplay.__set__ 'crop', sinon.stub().returns('http://foo')
        EditDisplay.__set__ 'ImageUploadForm', @ImageUploadForm = sinon.stub()
        @view = new EditDisplay el: $('#edit-display'), article: @article
        done()

  afterEach ->
    benv.teardown()
    Backbone.sync.restore()

  describe '#useArticleTitle', ->

    it 'uses the article title when clicked', ->
      @view.article.set title: 'foo'
      @view.$('.edit-display__use-article-title').click()
      @view.$('.edit-title-textarea').val().should.equal 'foo'

  describe '#checkTitleInput', ->

    it 'shows the use-title link when nothing is in the textarea', ->
      @view.$('.edit-title-textarea').val('')
      @view.checkTitleInput()
      @view.$('.edit-display__use-article-title').css('display').should.equal 'block'

    it 'hides the use-title link when the title equals the textarea', ->
      @view.article.set title: 'foo'
      @view.$('.edit-title-textarea').val('foo')
      @view.checkTitleInput()
      @view.$('.edit-display__use-article-title').attr('style').should.containEql 'display: none'

  describe '#updateCharCount', ->

    it 'updates the count when adding text', ->
      input = @view.$('.edit-title-textarea')
      input.val('Title')
      input.trigger 'keyup', true
      @view.$('.edit-display .edit-char-count').text().should.containEql '92'
