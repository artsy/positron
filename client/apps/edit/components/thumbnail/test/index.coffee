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
        benv.expose $: require('jquery'), resize: ((url) -> url)
        Backbone.$ = $
        sinon.stub Backbone, 'sync'
        EditThumbnail = benv.requireWithJadeify(
          resolve(__dirname, '../index')
          ['thumbnailFormTemplate']
        )
        EditThumbnail.__set__ 'gemup', @gemup = sinon.stub()
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

    it 'shows the use-title link when nothing is in the textarea', ->
      @view.$('.edit-title-textarea').val('')
      @view.checkTitleTextarea()
      @view.$('.edit-use-article-title').attr('style').should.not.containEql 'display: none'

    it 'hides the use-title link when the title equals the textarea', ->
      @view.article.set title: 'foo'
      @view.$('.edit-title-textarea').val('foo')
      @view.checkTitleTextarea()
      @view.$('.edit-use-article-title').attr('style').should.containEql 'display: none'

  describe '#setupEmailMetadata', ->

    it 'fills email data if present', ->
      @view.$('input[name=headline]').val().should.equal 'Foo'
      @view.$('input[name=author]').val().should.equal 'Craig Spaeth'
      @view.$('input[name=credit_line]').val().should.equal 'Credit Where Credit Needed'
      @view.$('input[name=credit_url]').val().should.equal 'http://credit'
      @view.$('.edit-email-small-image-url').html().should.containEql 'http://small'
      @view.$('.edit-email-large-image-url').html().should.containEql 'http://large'
