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
        article: @article = new Article fixtures().article
      ), =>
        benv.expose $: require('jquery'), resize: ((url) -> url)
        Backbone.$ = $
        sinon.stub Backbone, 'sync'
        EditThumbnail = benv.requireWithJadeify(
          resolve(__dirname, '../index')
          ['thumbnailFormTemplate']
        )
        EditThumbnail.__set__ 'gemup', @gemup = sinon.stub()
        @view = new EditThumbnail el: $('#edit-thumbnail'), article: @article
        done()

  afterEach ->
    benv.teardown()
    Backbone.sync.restore()

  describe '#renderThumbnailForm', ->

    it 'renders the thumbnail image on change', ->
      @view.article.set thumbnail_image: 'http://kittens.com/foo.jpg'
      @view.$el.html().should.containEql 'http://kittens.com/foo.jpg'

  describe '#removeThumbnail', ->

    it 'empties the thumbnail image', ->
      @view.removeThumbnail({ preventDefault: -> })
      (@view.article.get('thumbnail_image')?).should.not.be.ok

  describe '#uploadThumbnail', ->

    it 'uses gemup to upload an image and shows it in the DOM', ->
      @view.uploadThumbnail target: files: ['foo.jpg']
      @gemup.args[0][0].should.equal 'foo.jpg'
      img = null
      class global.Image
        constructor: -> img = this
      @gemup.args[0][1].done 'moo.jpg'
      img.onload()
      Backbone.sync.args[0][0].should.equal 'create'
      delete global.Image

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