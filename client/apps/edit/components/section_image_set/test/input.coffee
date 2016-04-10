benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
require 'react/addons'
r =
  find: React.addons.TestUtils.findRenderedDOMComponentWithClass
  simulate: React.addons.TestUtils.Simulate
  findAll: React.addons.TestUtils.scryRenderedDOMComponentsWithClass
{ div } = React.DOM
fixtures = require '../../../../../../test/helpers/fixtures'

describe 'Input', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      Input = benv.requireWithJadeify(
        resolve(__dirname, '../input'), ['icons']
      )
      @component = React.render Input(
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
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
        done()

  afterEach ->
    benv.teardown()

  it 'renders a caption', ->
    $(@component.getDOMNode()).html().should.containEql 'this is a caption!'

  it 'saves captions on click off', ->
    $(@component.refs.editable.getDOMNode()).html('Courtesy of The Guggenheim')
    @component.onEditableKeyup()
    @component.state.images[0].caption.should.equal 'Courtesy of The Guggenheim'
