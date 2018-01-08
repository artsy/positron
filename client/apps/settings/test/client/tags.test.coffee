_ = require 'underscore'
benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
fixtures = require '../../../../../test/helpers/fixtures'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
ReactDOMServer = require 'react-dom/server'
r =
  find: ReactTestUtils.findRenderedDOMComponentWithClass
  simulate: ReactTestUtils.Simulate

describe 'TagsView', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      { TagsView } = mod = benv.requireWithJadeify(
        resolve(__dirname, '../../client/tags')
        []
      )
      mod.__set__ 'FilterSearch', @FilterSearch = sinon.stub()
      mod.__set__ 'AddTag', @AddTag = sinon.stub()
      mod.__set__ 'sd', { API_URL: 'https://writer.artsy.net/api' }
      @request =
        post: sinon.stub().returns
          set: sinon.stub().returns
            send: sinon.stub().returns
              end: sinon.stub().yields(
                null,
                body: data: tags: [fixtures().tags]
              )
      mod.__set__ 'request', @request
      sinon.stub Backbone, 'sync'
      props = {
        tags: [fixtures().tags]
        public: true
      }
      @rendered = ReactDOMServer.renderToString(
        React.createElement(TagsView, props)
      )
      @component = ReactDOM.render(
        React.createElement(TagsView, props),
        (@$el = $ "<div></div>")[0],
        =>
      )
      done()

  afterEach ->
    Backbone.sync.restore()
    benv.teardown()

  it 'renders nav with active state', ->
    @rendered.should.containEql '"topic is-active"'
    @rendered.should.containEql '"internal "'

  it 'switches active state when tab is clicked', ->
    r.simulate.click r.find @component, 'internal'
    $(@component.refs.internalTab).hasClass('is-active').should.be.true()

  it 'inits FilterSearch component', ->
    @FilterSearch.args[0][0].url.should.equal 'https://writer.artsy.net/api/tags?public=true&limit=50&q=%QUERY'
    @FilterSearch.args[0][0].placeholder.should.equal 'Search for tag...'
    @FilterSearch.args[0][0].collection[0].name.should.equal 'Show Reviews'
    @FilterSearch.args[0][0].contentType.should.equal 'tag'

  it 'inits AddTag component', ->
    @AddTag.called.should.be.true()

  it '#getActiveState', ->
    @component.getActiveState(true).should.equal 'is-active'
    @component.setState(public: false)
    @component.getActiveState(true).should.equal ''

  it 'updates #searchResults', ->
    @component.searchResults [
      { id: '123', name: 'Berlin', public: true }
      { id: '456', name: 'China', public: true }
    ]
    @FilterSearch.args[2][0].collection.length.should.equal 2
    @FilterSearch.args[2][0].collection[0].name.should.equal 'Berlin'
    @FilterSearch.args[2][0].collection[1].name.should.equal 'China'
    @FilterSearch.args[2][0].collection[0].public.should.be.true()
    @FilterSearch.args[2][0].collection[1].public.should.be.true()

  describe '#setView', ->

    it 'sets topic tag view', ->
      @component.setView true
      @component.state.public.should.be.true()
      @component.state.tags.length.should.equal 1

    it 'sets internal tag view', ->
      @component.setView false
      @component.state.public.should.be.false()
      @component.state.tags.length.should.equal 1

  describe '#addTag', ->

    it 'adds tag on success', ->
      @component.addTag 'New Tag'
      Backbone.sync.args[0][0].should.equal 'create'
      Backbone.sync.args[0][1].attributes.name.should.equal 'New Tag'
      Backbone.sync.args[0][1].attributes.public.should.be.true()
      Backbone.sync.args[0][2].success fixtures().tags
      @FilterSearch.args[2][0].collection.length.should.equal 2

    it 'displays an error message on error', ->
      @component.addTag 'Repeat Tag'
      Backbone.sync.args[0][2].error()

      $(r.find(@component, 'tags-container')).html().should.containEql(
        'There has been an error. Please contact support.'
      )

  describe '#deleteTag', ->

    it 'removes tag from page on delete', ->
      @component.deleteTag id: '55356a9deca560a0137aa4b7'
      Backbone.sync.args[0][0].should.equal 'delete'
      Backbone.sync.args[0][2].success fixtures().tags
      @FilterSearch.args[2][0].collection.length.should.equal 0

    it 'displays an error message on error', ->
      @component.deleteTag id: '55356a9deca560a0137aa4b7'
      Backbone.sync.args[0][2].error()
      $(r.find(@component, 'tags-container')).html().should.containEql(
        'There has been an error. Please contact support.'
      )