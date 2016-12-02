_ = require 'underscore'
benv = require 'benv'
sinon = require 'sinon'
Article = require '../../../../../models/article'
Backbone = require 'backbone'
fixtures = require '../../../../../../test/helpers/fixtures'
{ resolve } = require 'path'

describe 'EditDisplay', ->

  beforeEach (done) ->
    benv.setup =>
      tmpl = resolve __dirname, '../index.jade'
      benv.render tmpl, _.extend(fixtures().locals,
        article: @article = new Article fixtures().articles
      ), =>
        benv.expose $: benv.require('jquery'), resize: ((url) -> url)
        Backbone.$ = $
        sinon.stub Backbone, 'sync'
        EditDisplay = benv.requireWithJadeify(
          resolve(__dirname, '../index')
          ['displayFormTemplate']
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

  describe '#updateCharCount', ->

    it 'updates the count when adding text', ->
      input = @view.$('.edit-display--magazine .edit-display__headline textarea')
      input.val('Title')
      input.trigger 'keyup'
      @view.$('.edit-display--magazine .edit-char-count').text().should.containEql '92'

  describe '#renderThumbnailForms', ->

    it 'uses dist channel images when present', ->
      @article.set 'social_image', 'http://socialimage'
      @article.set 'email_metadata', { image_url: 'http://emailimage' }
      @view.renderThumbnailForms()
      @ImageUploadForm.args[3][0].src.should.equal 'http://kitten.com'
      @ImageUploadForm.args[4][0].src.should.equal 'http://socialimage'
      @ImageUploadForm.args[5][0].src.should.equal 'http://emailimage'
