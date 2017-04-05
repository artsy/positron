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
      benv.expose $: benv.require 'jquery'
      window.jQuery = $
      Backbone.$ = $
      $.onInfiniteScroll = sinon.stub()
      AdminSuperArticle = benv.require resolve(__dirname, '../super_article/index.coffee')
      AdminSuperArticle.__set__ 'sd', {
        API_URL: 'http://localhost:3005/api'
        CURRENT_CHANNEL: id: '123'
        USER: access_token: ''
      }
      ImageUpload = benv.require resolve(__dirname, '../components/image_upload.coffee')
      AdminSuperArticle.__set__ 'async', async = sinon.stub()
      async.each = sinon.stub()
      AdminSuperArticle.__set__ 'request', request = sinon.stub().returns({get: get = sinon.stub()})
      AdminSuperArticle.__set__ 'ImageUpload', React.createFactory(ImageUpload)
      AdminSuperArticle.__set__ 'AutocompleteList', @Autocomplete = sinon.stub().returns({setState: setState = sinon.stub()})
      @channel = {id: '123'}
      @channel.hasFeature = sinon.stub().returns true
      @article = new Article
      @article.attributes = fixtures().articles
      props = {
        article: @article
        channel: @channel
        onChange: sinon.stub()
        }
      @component = ReactDOM.render React.createElement(AdminSuperArticle, props), (@$el = $ "<div></div>")[0], =>
        setTimeout =>
          done()

  afterEach ->
    benv.teardown()

  it 'renders the fields', ->
    $(ReactDOM.findDOMNode(@component)).find('input').length.should.eql 9
    $(ReactDOM.findDOMNode(@component)).find('input[type=file]').length.should.eql 3
    $(ReactDOM.findDOMNode(@component)).find('textarea').length.should.eql 1
    @Autocomplete.callCount.should.eql 1

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
    @component.upload 'http://partnerlogo.com/image.jpg', 'partner_logo'
    @component.state.super_article.partner_logo.should.eql 'http://partnerlogo.com/image.jpg'
    @component.props.onChange.args[0][0].super_article.partner_logo.should.eql 'http://partnerlogo.com/image.jpg'
