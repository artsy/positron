_ = require 'underscore'
benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
r =
  find: ReactTestUtils.findRenderedDOMComponentWithClass
  simulate: ReactTestUtils.Simulate

describe 'ImageCollectionArtwork', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      @Artwork = benv.requireWithJadeify(
        resolve(__dirname, '../components/artwork')
        ['icons']
      )
      @props = {
        i: 2
        artwork: {
          type: 'artwork'
          title: 'The Four Hedgehogs'
          id: '123'
          image: 'https://artsy.net/artwork.jpg'
          partner: name: 'Guggenheim'
          artists: [ { name: 'Van Gogh' }, { name: 'Van Dogh' } ]
        }
        removeItem: @removeItem = sinon.stub()
        editing: true
      }
      @component = ReactDOM.render React.createElement(@Artwork, @props), (@$el = $ "<div></div>")[0], =>
      done()

  afterEach ->
    benv.teardown()

  it 'renders an artwork', ->
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'https://artsy.net/artwork.jpg'

  it 'renders artwork data', ->
    $(ReactDOM.findDOMNode(@component)).html().should.containEql '<em>The Four Hedgehogs'
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'Guggenheim'
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'Van Gogh'
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'Van Dogh'

  it 'renders the remove button', ->
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'esic-img-remove'

  it 'calls removeItem when clicking remove icon', ->
    r.simulate.click r.find @component, 'esic-img-remove'
    @removeItem.called.should.eql true
    @removeItem.args[0][0].id.should.eql '123'

  it 'hides the remove button when not editing', (done) ->
    @props.editing = false
    component = ReactDOM.render React.createElement(@Artwork, @props), (@$el = $ "<div></div>")[0], =>
    $(ReactDOM.findDOMNode(component)).html().should.not.containEql 'esic-img-remove'
    done()
