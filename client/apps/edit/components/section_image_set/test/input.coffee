benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'

fixtures = require '../../../../../../test/helpers/fixtures'

describe 'Input', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      Input = benv.requireWithJadeify(
        resolve(__dirname, '../input'), ['icons']
      )
      props = {
        caption: 'this is a caption!'
        url: 'https://artsy.net/image.png'
        images: [
          {
            type: 'image'
            url: 'https://artsy.net/image.png'
            caption: 'this is a caption!'
          }
        ]
        editing: false
      }
      @component = ReactDOM.render React.createElement(Input, props), (@$el = $ "<div></div>")[0], =>
        setTimeout =>
          done()

  afterEach ->
    benv.teardown()

  it 'renders a caption', ->
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'this is a caption!'

  it 'saves captions on click off', ->
    $(ReactDOM.findDOMNode(@component.refs.editable)).html('Courtesy of The Guggenheim')
    ReactTestUtils.Simulate.keyUp(@component.refs.editable)
    @component.state.images[0].caption.should.equal 'Courtesy of The Guggenheim'
