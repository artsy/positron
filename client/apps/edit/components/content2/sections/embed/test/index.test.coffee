benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
ReactDOMServer = require 'react-dom/server'
Section = require '../../../../../../../models/section.coffee'
r =
  find: ReactTestUtils.scryRenderedDOMComponentsWithClass
  simulate: ReactTestUtils.Simulate

describe 'SectionEmbed', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      window.matchMedia = sinon.stub().returns(
        {
          matches: false
          addListener: sinon.stub()
          removeListener: sinon.stub()
        }
      )
      @SectionEmbed = benv.require resolve __dirname, '../index'
      @component = ReactDOM.render React.createElement(@SectionEmbed,
        section: new Section {type: 'embed'}
        editing: true
        article: new Backbone.Model {layout: 'standard'}
        channel: { isArtsyChannel: sinon.stub().returns(true) }
        setEditing: ->
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub Backbone, 'sync'
        done()

  afterEach ->
    Backbone.sync.restore()
    benv.teardown()

  it 'destroys an empty section when clicking off', ->
    @component.props.section.on 'destroy', spy = sinon.spy()
    @component.onClickOff()
    spy.called.should.be.ok

  it 'sets a default layout of column_width', ->
    $(ReactDOM.findDOMNode(@component)).html().should.containEql(
      '<a name="column_width" class="layout" data-active="true">'
    )

  it 'renders a placeholder', ->
    $(ReactDOM.findDOMNode(@component)).html().should.containEql(
      '<div class="edit-section--embed__placeholder">Add URL above'
    )

  it 'renders saved content', ->
    @component.props.section.set 'url', 'https://files.artsy.net'
    @component.forceUpdate()
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'src="https://files.artsy.net"'

  it 'renders saved width and height', ->
    @component.props.section.set(
      url: 'https://files.artsy.net'
      height: 600
      mobile_height: 400
    )
    @component.forceUpdate()
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'name="height" value="600"'
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'name="mobile_height" value="400"'
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'height="600"></iframe>'

  it 'renders the layout controls', ->
    $(ReactDOM.findDOMNode(@component)).find('.layout').length.should.eql 2

  it 'renders fullscreen layout controls when article is feature', ->
    @component.props.article.set 'layout', 'feature'
    @component.forceUpdate()
    $(ReactDOM.findDOMNode(@component)).find('.layout').length.should.eql 3

  it 'changes layout when clicking on layout controls', ->
    r.simulate.click r.find(@component, 'layout')[0]
    @component.props.section.get('layout').should.equal 'overflow_fillwidth'
