_ = require 'underscore'
benv = require 'benv'
sinon = require 'sinon'
Article = require '../../../../../models/article'
Backbone = require 'backbone'
fixtures = require '../../../../../../test/helpers/fixtures'
{ resolve } = require 'path'

describe 'EditHeader', ->

  beforeEach (done) ->
    benv.setup =>
      tmpl = resolve __dirname, '../index.jade'
      benv.render tmpl, _.extend(fixtures().locals,
        article: @article = new Article fixtures().article
      ), =>
        benv.expose $: require('jquery')
        Backbone.$ = $
        sinon.stub Backbone, 'sync'
        EditHeader = require '../index'
        @view = new EditHeader el: $('#edit-header'), article: @article
        done()

  afterEach ->
    benv.teardown(false)
    Backbone.sync.restore()

  describe '#saving', ->

    it 'indicates saving on change', ->
      @view.article.trigger 'change'
      @view.$('#edit-save').hasClass('is-saving').should.be.ok

  describe '#delete', ->

    it 'deletes the article', ->
      global.confirm = -> true
      @view.article.on 'destroy', spy = sinon.spy()
      @view.delete()
      spy.called.should.be.ok
      delete global.confirm

  describe '#toggleCheckmarks', ->

    it 'sets a checkmark when finished with content', ->
      @article.set title: 'foobar'
      @view.toggleCheckmarks()
      @view.$('#edit-tabs a:eq(0)').attr('data-complete').should.equal 'true'

    it 'saves on clicking save', ->
      @view.save()
      Backbone.sync.args[0][0].should.equal 'create'
