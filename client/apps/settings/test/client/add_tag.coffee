_ = require 'underscore'
benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
ReactDOMServer = require 'react-dom/server'
r =
  find: ReactTestUtils.findRenderedDOMComponentWithClass
  simulate: ReactTestUtils.Simulate

describe 'AddTag', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      AddTag = benv.requireWithJadeify(
        resolve(__dirname, '../../client/add_tag')
        []
      )
      props = {
        addTag: sinon.stub()
      }
      @rendered = ReactDOMServer.renderToString React.createElement(AddTag, props)
      @component = ReactDOM.render React.createElement(AddTag, props), (@$el = $ "<div></div>")[0], =>
      done()

  afterEach ->
    benv.teardown()

  it 'renders an input and button', ->
    @rendered.should.containEql '<button'
    @rendered.should.containEql '<input'
    @rendered.should.containEql 'Enter tag title...'

  it 'calls addTag when new tag is submitted', ->
    @component.setState value: 'New Tag'
    r.simulate.click r.find @component, 'avant-garde-button'
    @component.props.addTag.called.should.be.true()
    @component.props.addTag.args[0][0].should.equal 'New Tag'

  it 'clears the input after button is clicked', ->
    @component.setState value: 'New Tag'
    r.simulate.click r.find @component, 'avant-garde-button'
    @component.state.value.length.should.equal 0