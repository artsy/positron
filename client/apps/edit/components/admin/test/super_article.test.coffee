benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
_ = require 'underscore'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
ReactDOMServer = require 'react-dom/server'
fixtures = require '../../../../../../test/helpers/fixtures.coffee'
Article = require '../../../../../models/article.coffee'
Backbone = require 'backbone'

r =
  find: ReactTestUtils.findRenderedDOMComponentWithClass
  simulate: ReactTestUtils.Simulate

describe 'AdminSuperArticle', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose
        $: benv.require 'jquery'
        Bloodhound: (Bloodhound = sinon.stub()).returns(
          initialize: ->
          ttAdapter: ->
        )
      window.jQuery = $
      window.matchMedia = sinon.stub().returns({
        matches: sinon.stub()
      })
      Backbone.$ = $
      $.fn.typeahead = sinon.stub()
      sinon.stub(Backbone, 'sync')
      AdminSuperArticle = benv.require resolve(__dirname, '../super_article/index.coffee')
      AdminSuperArticle.__set__ 'sd', {
        API_URL: 'http://localhost:3005/api'
        CURRENT_CHANNEL: id: '123'
        USER: access_token: ''
      }
      ImageUpload = benv.require resolve(__dirname, '../components/image_upload.coffee')
      AdminSuperArticle.__set__ 'ImageUpload', React.createFactory ImageUpload
      @AutocompleteList = benv.require resolve __dirname, '../../../../../components/autocomplete_list/index.coffee'
      @AutocompleteList.__set__ 'DragContainer', sinon.stub()
      @AutocompleteList.__set__ 'request', get: sinon.stub().returns
        set: sinon.stub().returns
          end: sinon.stub().yields(null, body: {results: [{ id: '123', title: 'Artists'}]})
      AdminSuperArticle.__set__ 'AutocompleteList', React.createFactory @AutocompleteList
      @channel = {id: '123'}
      @channel.hasFeature = sinon.stub().returns true
      @article = new Article fixtures().articles
      props = {
        article: @article
        channel: @channel
        onChange: sinon.stub()
        }
      @component = ReactDOM.render React.createElement(AdminSuperArticle, props), (@$el = $ "<div></div>")[0], =>
        setTimeout =>
          done()

  afterEach ->
    Backbone.sync.restore()
    benv.teardown()

  it 'renders the fields', ->
    $(ReactDOM.findDOMNode(@component)).find('input').length.should.eql 12
    $(ReactDOM.findDOMNode(@component)).find('input[type=file]').length.should.eql 3
    $(ReactDOM.findDOMNode(@component)).find('textarea').length.should.eql 1
    $(ReactDOM.findDOMNode(@component)).find('.autocomplete-input').first().attr('placeholder').should.eql 'Search articles by title...'

  it 'Inputs are populated with article data', ->
    $(ReactDOM.findDOMNode(@component)).find('input[name=partner_link_title]').val().should.eql 'Download The App'
    $(ReactDOM.findDOMNode(@component)).find('input[name=partner_link]').val().should.eql 'http://partnerlink.com'
    $(ReactDOM.findDOMNode(@component)).find('input[name=partner_logo_link]').val().should.eql 'http://itunes'
    $(ReactDOM.findDOMNode(@component)).find('input[name=secondary_logo_text]').val().should.eql 'In Partnership With'
    $(ReactDOM.findDOMNode(@component)).find('input[name=secondary_logo_link]').val().should.eql 'http://secondary'
    $(ReactDOM.findDOMNode(@component)).find('textarea[name=footer_blurb]').val().should.eql 'This is a Footer Blurb'
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'http://partnerlink.com/logo.jpg'
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'http://partnerlink.com/blacklogo.jpg'
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'http://secondarypartner.com/logo.png'
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'Footer Title'

  it 'enables input when is_super_article is enabled', ->
    @component.props.article.set 'is_super_article', true
    @component.forceUpdate()
    $(ReactDOM.findDOMNode(@component)).find('input[name=partner_link_title]').prop('disabled').should.eql false
    $(ReactDOM.findDOMNode(@component)).find('textarea[name=footer_blurb]').prop('disabled').should.eql false

  it 'disables input unless is_super_article is enabled', ->
    $(ReactDOM.findDOMNode(@component)).find('input[name=partner_link_title]').prop('disabled').should.eql true
    $(ReactDOM.findDOMNode(@component)).find('textarea[name=footer_blurb]').prop('disabled').should.eql true

  it 'updates state with user input', ->
    input = ReactDOM.findDOMNode(r.find @component, 'partner_link_title')
    input.value = 'A new value'
    r.simulate.change(input)
    @component.state.super_article.partner_link_title.should.eql 'A new value'
    @component.props.onChange.args[0][1].partner_link_title.should.eql 'A new value'

  it 'updates state on image upload', ->
    @component.upload 'partner_logo', 'http://partnerlogo.com/image.jpg'
    @component.state.super_article.partner_logo.should.eql 'http://partnerlogo.com/image.jpg'
    @component.props.onChange.args[0][0].super_article.partner_logo.should.eql 'http://partnerlogo.com/image.jpg'

  it 'adds a flag to super sub articles when they are added', ->
    @component.saveWithRelatedArticle([id: '123'], '123', true)
    Backbone.sync.args[0][2].success()
    @component.state.super_article.related_articles.should.containEql('123')

  it 'does not add article if there is an error adding one', ->
    @component.saveWithRelatedArticle([id: '123'], '123', true)
    Backbone.sync.args[0][2].error()
    @component.state.super_article.related_articles.length.should.equal 1

  it 'adds a flag to super sub articles when they are removed', ->
    @component.saveWithRelatedArticle([id: '123'], '123', false)
    Backbone.sync.args[0][2].success()
    @component.state.super_article.related_articles.length.should.equal 0

  it 'does not remove article if there is an error removing one', ->
    @component.saveWithRelatedArticle([id: '123'], '123', false)
    Backbone.sync.args[0][2].error()
    @component.state.super_article.related_articles.length.should.equal 1
