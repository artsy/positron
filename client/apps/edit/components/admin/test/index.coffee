_ = require 'underscore'
benv = require 'benv'
sinon = require 'sinon'
Article = require '../../../../../models/article'
Backbone = require 'backbone'
moment = require 'moment'
should = require 'should'
fixtures = require '../../../../../../test/helpers/fixtures'
{ fabricate } = require 'antigravity'
{ resolve } = require 'path'

describe 'EditAdmin', ->

  beforeEach (done) ->
    benv.setup =>
      tmpl = resolve __dirname, '../index.jade'
      benv.render tmpl, _.extend(fixtures().locals,
        article: @article = new Article fixtures().articles
      ), =>
        benv.expose $: benv.require('jquery')
        Backbone.$ = $
        @e = new $.Event('click')
        sinon.stub Backbone, 'sync'
        EditAdmin = benv.requireWithJadeify '../index',
          ['featuredListTemplate']
        EditAdmin.__set__ 'ImageUploadForm', @ImageUploadForm = sinon.stub()
        EditAdmin::setupAuthorAutocomplete = sinon.stub()
        EditAdmin::setupFairAutocomplete = sinon.stub()
        EditAdmin::setupPartnerAutocomplete = sinon.stub()
        EditAdmin::setupAuctionAutocomplete = sinon.stub()
        EditAdmin::setupSectionAutocomplete = sinon.stub()
        EditAdmin::setupShowsAutocomplete = sinon.stub()
        EditAdmin::setupBiographyAutocomplete = sinon.stub()
        EditAdmin::renderScheduleState = sinon.stub()
        EditAdmin::setupContributingAuthors = sinon.stub()
        EditAdmin::setupSuperArticleAutocomplete = sinon.stub()
        EditAdmin::setupSuperArticleImages = sinon.stub()
        @view = new EditAdmin el: $('#edit-admin'), article: @article
        done()

  afterEach ->
    benv.teardown()
    Backbone.sync.restore()

  describe '#onOpen', ->

    it 'fetches featured and mentioned articles', ->
      @view.article.fetchFeatured = sinon.stub()
      @view.article.fetchMentioned = sinon.stub()
      @view.onOpen()
      @view.article.fetchFeatured.called.should.be.ok
      @view.article.fetchMentioned.called.should.be.ok

  describe '#renderFeatured', ->

    it 'renders the featured artists', ->
      artist = fabricate('artist')
      artist.name = 'Andy Foobar'
      @view.article.featuredArtists.set [artist]
      @view.renderFeatured()
      @view.$el.html().should.containEql 'Andy Foobar'

    it 'renders primary featured', ->
      artist = fabricate('artist')
      artist.name = 'Andy Moobar'
      @view.article.featuredPrimaryArtists.set [artist]
      @view.renderFeatured()
      @view.$el.html().should.containEql 'Andy Moobar'

  describe '#featureFromInput', ->

    it 'adds a featured artist from a url put in an input', ->
      @view.article.featuredArtists.add = sinon.stub()
      @view.featureFromInput('Artists')(
        currentTarget: $ "<input value='/andy-warhol' />"
      )
      Backbone.sync.args[0][1].id.should.equal 'andy-warhol'

  describe '#featureMentioned', ->

    it 'adds a featured article on clicking a mention', ->
      @view.article.featuredArtists.set { id: 'foo', artist: {} }
      @view.article.mentionedArtists.set { id: 'bar', artist: {} }
      @view.featureMentioned('Artists')(
        currentTarget: $ "<input data-id='bar' />"
      )
      (@view.article.featuredArtists.get('bar')?).should.be.ok

  describe '#onAuthorSelect', ->

    it 'changes the author', ->
      global.confirm = -> true
      @view.onAuthorSelect {}, { id: 'foo' }
      @view.article.get('author_id').should.equal 'foo'
      delete global.confirm

  describe '#setupEmailMetadata', ->

    it 'fills email data if present', ->
      @view.setupEmailMetadata()
      @view.$('input[name=headline]').val().should.equal 'Foo'
      @view.$('input[name=author]').val().should.equal 'Craig Spaeth'
      @view.$('input[name=credit_line]').val().should.equal 'Credit Where Credit Needed'
      @view.$('input[name=credit_url]').val().should.equal 'http://credit'
      @view.$('.edit-email-small-image-url input').val().should.containEql 'img.png'
      @view.$('.edit-email-large-image-url input').val().should.containEql 'img.png'

  describe '#toggleScheduled', ->

    it 'can save the scheduled publish date and time', ->
      @view.article.set {scheduled_publish_at: null}
      date = '11/11/11'
      time = '12:30'
      dateAndTime = date + ' ' + time
      global.confirm = -> true
      @view.$('.edit-admin-input-date').val(date)
      @view.$('.edit-admin-input-time').val(time)
      @view.toggleScheduled(@e)
      @view.article.get('scheduled_publish_at').should.containEql moment(dateAndTime, 'MM/DD/YYYY HH:mm').toDate()
      delete global.confirm

    it 'can unset the scheduled publish time', ->
      @view.article.set {scheduled_publish_at: '2015-11-11T22:59:00.000Z'}
      @view.toggleScheduled(@e)
      should.equal(@view.article.get('scheduled_publish_at'), null)

  describe '#setupPublishDate', ->

    it 'can set the publish date and time', ->
      date = '11/11/11'
      time = '12:30'
      dateAndTime = date + ' ' + time
      @view.$('.edit-admin-input-date').val(date)
      @view.$('.edit-admin-input-time').val(time)
      @view.$('.edit-admin-input-time').trigger('blur')
      @view.article.get('published_at').should.containEql moment(dateAndTime, 'MM/DD/YYYY HH:mm').toDate()
