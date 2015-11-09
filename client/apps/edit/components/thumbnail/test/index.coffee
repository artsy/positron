_ = require 'underscore'
benv = require 'benv'
sinon = require 'sinon'
Article = require '../../../../../models/article'
Backbone = require 'backbone'
fixtures = require '../../../../../../test/helpers/fixtures'
{ resolve } = require 'path'

describe 'EditThumbnail', ->

  beforeEach (done) ->
    benv.setup =>
      tmpl = resolve __dirname, '../index.jade'
      benv.render tmpl, _.extend(fixtures().locals,
        article: @article = new Article fixtures().articles
      ), =>
        benv.expose $: benv.require('jquery'), resize: ((url) -> url)
        Backbone.$ = $
        sinon.stub Backbone, 'sync'
        EditThumbnail = benv.requireWithJadeify(
          resolve(__dirname, '../index')
          ['thumbnailFormTemplate']
        )
        EditThumbnail.__set__ 'gemup', @gemup = sinon.stub()
        EditThumbnail.__set__ 'crop', sinon.stub().returns('http://foo')
        EditThumbnail.__set__ 'ImageUploadForm', @ImageUploadForm = sinon.stub()
        @view = new EditThumbnail el: $('#edit-thumbnail'), article: @article
        done()

  afterEach ->
    benv.teardown()
    Backbone.sync.restore()

  describe '#useArticleTitle', ->

    it 'uses the article title when clicked', ->
      @view.article.set title: 'foo'
      @view.$('.edit-use-article-title').click()
      @view.$('.edit-title-textarea').val().should.equal 'foo'

  describe '#checkTitleTextArea', ->

    xit 'shows the use-title link when nothing is in the textarea', ->
      @view.$('.edit-title-textarea').val('')
      @view.checkTitleTextarea()
      @view.$('.edit-use-article-title').attr('style').should.not.containEql 'display: none'

    it 'hides the use-title link when the title equals the textarea', ->
      @view.article.set title: 'foo'
      @view.$('.edit-title-textarea').val('foo')
      @view.checkTitleTextarea()
      @view.$('.edit-use-article-title').attr('style').should.containEql 'display: none'

  describe '#updateCharCount', ->

    it 'updates the count when adding text', ->
      @view.$('.edit-title-textarea').val('Title')
      @view.updateCharCount()
      @view.$('.edit-char-count').text().should.containEql '92'
