_ = require 'underscore'
benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
moment = require 'moment'
fixtures = require '../../../../../../test/helpers/fixtures.coffee'
Article = require '../../../../../models/article.coffee'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
r =
  find: ReactTestUtils.findRenderedDOMComponentWithClass
  simulate: ReactTestUtils.Simulate

describe 'EditContent', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      global.HTMLElement = () => {}
      window.matchMedia = sinon.stub().returns(
        {
          matches: false
          addListener: sinon.stub()
          removeListener: sinon.stub()
        }
      )
      @EditContent = benv.require resolve(__dirname, '../index.coffee')
      HeroSection = benv.require resolve(__dirname, '../sections/hero/index.jsx')
      SectionList = @SectionList = sinon.stub()
      Header = benv.require resolve(__dirname, '../sections/header')
      @EditContent.__set__ 'HeroSection', HeroSection
      @EditContent.__set__ 'Header', Header
      @EditContent.__set__ 'SectionList', SectionList
      @article = new Article _.extend fixtures().articles,
        layout: 'classic'
        author:
          name: 'Artsy Editorialz'
          id: '123'
        published: false
        published_at: null
      @props = {
        article: @article
        channel: {hasFeature: @hasFeature = sinon.stub().returns(true)}
      }
      @component = ReactDOM.render React.createElement(@EditContent, @props), (@$el = $ "<div></div>")[0], =>
      @component.debouncedSave = sinon.stub()
      done()

  afterEach ->
    benv.teardown()

  describe 'Render', ->

    it 'renders the hero section if channel hasFeature and layout is classic', ->
      $(ReactDOM.findDOMNode(@component)).html().should.containEql '<div class="edit-section--hero">'

    it 'does not render the hero section if hasFeature is false', ->
      @props.channel.hasFeature = sinon.stub().returns(false)
      @props.article.set 'hero_section', null
      component = ReactDOM.render React.createElement(@EditContent, @props), (@$el = $ "<div></div>")[0], =>
      $(ReactDOM.findDOMNode(component)).html().should.not.containEql '<div class="edit-section--hero">'

    it 'does not render the hero section if layout is standard', ->
      @props.article.set 'layout', 'standard'
      component = ReactDOM.render React.createElement(@EditContent, @props), (@$el = $ "<div></div>")[0], =>
      $(ReactDOM.findDOMNode(component)).html().should.not.containEql '<div class="edit-section--hero">'

    it 'renders the header section', ->
      $(ReactDOM.findDOMNode(@component)).html().should.containEql '<div class="edit-header">'

    it 'renders the section list', ->
      @SectionList.called.should.eql true

  describe '#saveArticle', ->

    it 'calls saveArticle when a section is changed', ->
      @component.saveArticle = sinon.stub()
      @component.props.article.sections.models[1].set 'caption', 'This is a new caption'
      @component.saveArticle.called.should.eql true

    it '#saveArticle calls debouncedSave if unpublished', ->
      @component.saveArticle()
      @component.debouncedSave.called.should.eql true

    it '#saveArticle does not autosave if published', ->
      @component.props.article.set 'published', true
      @component.saveArticle()
      @component.debouncedSave.called.should.eql false
