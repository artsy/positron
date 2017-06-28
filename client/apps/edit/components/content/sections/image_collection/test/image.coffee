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

describe 'ImageCollectionImage', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      global.HTMLElement = () => {}
      @Image = benv.requireWithJadeify(
        resolve(__dirname, '../components/image')
        ['icons']
      )
      RichTextCaption = benv.requireWithJadeify(
        resolve(__dirname,'../../../../../../../components/rich_text_caption/index.coffee')
        ['icons']
      )
      @Image.__set__ 'RichTextCaption', React.createFactory RichTextCaption
      @props = {
        i: 2
        image: {
          type: 'image'
          url: 'https://artsy.net/image.png'
          caption: '<p>Here is a caption</p>'
        }
        editing: false
        progress: null
        removeItem: @removeItem = sinon.stub()
      }
      @component = ReactDOM.render React.createElement(@Image, @props), (@$el = $ "<div></div>")[0], =>
      done()

  afterEach ->
    benv.teardown()

  it 'renders an image', ->
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'https%3A%2F%2Fartsy.net%2Fimage.png'

  it 'renders image caption if not editing', ->
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'Here is a caption'

  it 'hides remove button if not editing', ->
    $(ReactDOM.findDOMNode(@component)).html().should.not.containEql 'esic-img-remove'

  it 'renders image caption input and remove button if editing', (done) ->
    @props.editing = true
    @component = ReactDOM.render React.createElement(@Image, @props), (@$el = $ "<div></div>")[0], =>
    $(ReactDOM.findDOMNode(@component)).html().should.containEql '<div class="rich-text--caption">'
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'esic-img-remove'
    done()

  it 'calls removeItem when clicking remove icon', (done) ->
    @props.editing = true
    component = ReactDOM.render React.createElement(@Image, @props), (@$el = $ "<div></div>")[0], =>
    r.simulate.click r.find component, 'esic-img-remove'
    @removeItem.called.should.eql true
    @removeItem.args[0][0].url.should.eql 'https://artsy.net/image.png'
    done()
