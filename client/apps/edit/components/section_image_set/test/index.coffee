benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
ReactDOMServer = require 'react-dom/server'

fixtures = require '../../../../../../test/helpers/fixtures'

describe 'SectionImageSet', ->

  beforeEach (done) ->
    global.Image = class Image
      constructor: ->
        setTimeout => @onload()
      onload: ->
      width: 120
      height: 90
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      SectionImageSet = benv.requireWithJadeify(
        resolve(__dirname, '../index'), ['icons']
      )
      SectionImageSet.__set__ 'gemup', @gemup = sinon.stub()
      SectionImageSet.__set__ 'Autocomplete', sinon.stub()
      SectionImageSet.__set__ 'Input', sinon.stub()
      SectionImageSet.__set__ 'resize', (url)-> url
      props = {
        section: new Backbone.Model
          type: 'image_set'
          images: [
            {
              type: 'image'
              url: 'https://artsy.net/image.png'
              caption: null
            }
            {
              type: 'artwork'
              title: 'The Four Hedgehogs'
              id: '123'
              image: 'https://artsy.net/artwork.jpg'
              partner: name: 'Guggenheim'
              artists: [ { name: 'Van Gogh' }, { name: 'Van Dogh' } ]
            }
          ]
        editing: false
        setEditing: -> ->
      }
      @rendered = ReactDOMServer.renderToString React.createElement(SectionImageSet, props)
      @component = ReactDOM.render React.createElement(SectionImageSet, props), (@$el = $ "<div></div>")[0], =>
        setTimeout =>
          sinon.stub @component, 'setState'
          sinon.stub @component, 'componentWillUpdate'
          sinon.stub Backbone, 'sync'
          sinon.stub @component, 'removeItem'
          sinon.stub $, 'ajax'
          done()

  afterEach ->
    $.ajax.restore()
    Backbone.sync.restore()
    benv.teardown()
    delete global.Image

  it 'uploads to gemini', (done) ->
    @component.upload target: files: ['foo']
    @gemup.args[0][0].should.equal 'foo'
    @gemup.args[0][1].done('fooza')
    setTimeout =>
      @component.setState.args[0][0].images[2].url.should.equal 'fooza'
      @component.setState.args[0][0].images[2].type.should.equal 'image'
      @component.setState.args[0][0].images[2].width.should.equal 120
      @component.setState.args[0][0].images[2].height.should.equal 90
      @component.componentWillUpdate.called.should.be.ok
      done()

  it 'renders an image', ->
    $(@rendered).html().should.containEql 'https://artsy.net/image.png'

  it 'renders an artwork', ->
    $(@rendered).html().should.containEql 'https://artsy.net/artwork.jpg'

  it 'renders artwork data', ->
    $(@rendered).html().should.containEql 'The Four Hedgehogs'
    $(@rendered).html().should.containEql 'Guggenheim'
    $(@rendered).html().should.containEql 'Van Gogh'
    $(@rendered).html().should.containEql 'Van Dogh'

  it 'renders a preview', ->
    $(@rendered).html().should.containEql 'src="https://artsy.net/image.png" class="esis-preview-image"'
    $(@rendered).html().should.containEql '"https://artsy.net/artwork.jpg" class="esis-preview-image"'
