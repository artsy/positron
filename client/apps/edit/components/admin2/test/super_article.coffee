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
      AdminSuperArticle = mod =  benv.require resolve(__dirname, '../super_article/index.coffee')
      mod.__set__ 'setupSuperArticleAutocomplete', sinon.stub()
      mod.__set__ 'sd', {
        API_URL: 'http://localhost:3005/api'
        CURRENT_CHANNEL: id: '123'
        USER: access_token: ''
      }
      ImageUpload = benv.require resolve(__dirname, '../image_upload.coffee')
      mod.__set__ 'ImageUpload', React.createFactory(ImageUpload)
      @channel = {id: '123'}
      @channel.hasFeature = sinon.stub().returns false
      @article = new Article
      @article.attributes = fixtures().articles
      props = {
        article: @article
        channel: @channel
        onChange: sinon.stub()
        }
      @component = ReactDOM.render React.createElement(AdminSuperArticle, props), (@$el = $ "<div></div>")[0], =>
        setTimeout =>
          sinon.stub @component, 'setupSuperArticleAutocomplete'
          done()

  afterEach ->
    benv.teardown()

  it 'renders the fields', ->
    $(ReactDOM.findDOMNode(@component)).find('input').length.should.eql 9
    $(ReactDOM.findDOMNode(@component)).find('textarea').length.should.eql 1
    console.log @component.setupSuperArticleAutocomplete.callCount
    # $(@rendered).html().should.containEql 'Published'
    # $(@rendered).html().should.containEql 'Drafts'
    # $(@rendered).html().should.containEql 'Artsy Editorial'

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



  xit 'updates feed when nav is clicked', ->
    # @component.state.published.should.equal true
    # r.simulate.click r.find @component, 'drafts'
    # @component.setState.args[0][0].published.should.equal false