benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
ReactDOMServer = require 'react-dom/server'
r =
  find: ReactTestUtils.findRenderedDOMComponentWithClass
  simulate: ReactTestUtils.Simulate
  render: ReactTestUtils.renderIntoDocument

describe 'SectionControls', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      @SectionControls = benv.require resolve(__dirname, '../index')
      @props = {
        section: new Backbone.Model
          type: 'image_collection'
          layout: 'overflow_fillwidth'
        editing: true
        channel: { isEditorial: sinon.stub().returns(true) }
      }
      @component = ReactDOM.render React.createElement(@SectionControls, @props), (@$el = $ "<div></div>")[0], =>
      @component.insideComponent = sinon.stub()
      @$el.append( $section = $
        "<div class='edit-section-container' data-editing='true' style='height:300px'>
          <div class='edit-section-controls'></div>
        </div>"
      )
      done()

  afterEach ->
    benv.teardown()

  it 'sets insideComponent to state on mount', ->
    console.log $(@$el).html()