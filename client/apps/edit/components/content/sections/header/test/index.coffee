_ = require 'underscore'
benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
moment = require 'moment'
fixtures = require '../../../../../../../../test/helpers/fixtures.coffee'
Article = require '../../../../../../../models/article.coffee'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
r =
  find: ReactTestUtils.findRenderedDOMComponentWithClass
  simulate: ReactTestUtils.Simulate

describe 'SectionHeader', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      global.HTMLElement = () => {}
      SectionHeader = benv.require resolve(__dirname, '../index.coffee')
      RichTextParagraph = benv.require resolve(__dirname, '../../../../../../../components/rich_text/components/input_paragraph.coffee')
      SectionHeader.__set__ 'RichTextParagraph', React.createFactory RichTextParagraph
      @article = new Article _.extend fixtures().articles,
        author:
          name: 'Artsy Editorial'
          id: '123'
        published: false
        published_at: null
      props = {
        article: @article
        saveArticle: @saveArticle = sinon.stub()
      }
      @component = ReactDOM.render React.createElement(SectionHeader, props), (@$el = $ "<div></div>")[0], =>
      done()

  afterEach ->
    benv.teardown()

  describe 'Title', ->

    it 'renders an title field', ->
      $(ReactDOM.findDOMNode(@component)).find('#edit-title textarea').prop('placeholder').should.eql 'Type a title'

    it 'Can display a saved title', ->
      $(ReactDOM.findDOMNode(@component)).find('#edit-title textarea').val().should.eql 'Top Ten Booths'

    it '#setTitle sets article title on change', ->
      input = r.find @component, 'invisible-input'
      input.value = 'Top 8 Booths'
      r.simulate.keyUp input
      @component.props.article.get('title').should.eql 'Top 8 Booths'

    it '#changeTitle does not allow linebreaks', ->
      e = {
        key: "Enter"
        preventDefault: preventDefault = sinon.stub()
      }
      @component.changeTitle(e)
      preventDefault.called.should.eql true

    it 'Calls #saveArticle on change', ->
      input = r.find @component, 'invisible-input'
      input.value = 'Top 8 Booths'
      r.simulate.keyUp input
      @component.props.saveArticle.called.should.eql true

  describe 'Lead Paragraph', ->

    it 'renders a lead paragraph component', ->
      $(ReactDOM.findDOMNode(@component)).html().should.containEql '<div class="rich-text--paragraph__input">'

    it 'Can display a saved lead paragraph', ->
      $(ReactDOM.findDOMNode(@component)).html().should.containEql 'Just before the lines start forming...'

    it '#setLeadParagraph sets and saves article lead paragraph on change', ->
      @component.setLeadParagraph('<p>A new paragraph</p>')
      @component.props.article.leadParagraph.get('text').should.eql '<p>A new paragraph</p>'
      @component.props.saveArticle.called.should.eql true

  describe 'Author /Date ', ->

    it 'renders the author name', ->
      $(ReactDOM.findDOMNode(@component)).html().should.containEql '<p class="article-author">Artsy Editorial</p>'

    it 'renders a published date', ->
      $(ReactDOM.findDOMNode(@component)).html().should.containEql '<p class="article-date">'

    it '#getPublishDate returns the current date if unpublished and no scheduled_publish_at', ->
      now = moment().format('MMM D, YYYY')
      $(ReactDOM.findDOMNode(@component)).find('.article-date').text().should.containEql now

    it 'renders scheduled_publish_at if unpublished and scheduled', ->
      scheduled = moment().add(1, 'years')
      @component.props.article.set('scheduled_publish_at', scheduled.toISOString())
      @component.forceUpdate()
      $(ReactDOM.findDOMNode(@component)).find('.article-date').text().should.containEql scheduled.format('MMM D, YYYY')

    it 'renders a published_at if published', ->
      published = moment().subtract(1, 'years')
      @component.props.article.set('published', true)
      @component.props.article.set('published_at', published.toISOString())
      @component.forceUpdate()
      $(ReactDOM.findDOMNode(@component)).find('.article-date').text().should.containEql published.format('MMM D, YYYY')
