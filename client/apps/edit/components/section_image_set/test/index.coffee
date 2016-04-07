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

describe 'SectionImageSet', ->

  beforeEach (done) ->
    global.Image = class Image
      constructor: ->
        setTimeout => @onload()
      onload: ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      SectionImageSet = benv.requireWithJadeify(
        resolve(__dirname, '../index'), ['icons']
      )
      SectionImageSet.__set__ 'gemup', @gemup = sinon.stub()
      SectionImageSet.__set__ 'Autocomplete', sinon.stub()
      @component = React.render SectionImageSet(
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
              artist: name: 'Van Gogh'
            }
          ]
        editing: false
        setEditing: -> ->
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
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
      done()

  it 'saves the url after upload', (done) ->
    @component.upload target: files: ['foo']
    @gemup.args[0][1].done('fooza')
    setTimeout =>
      @component.componentWillUpdate.called.should.be.ok
      done()

  it 'renders an image', ->
    $(@component.getDOMNode()).html().should.containEql 'https://artsy.net/image.png'

  it 'saves captions on click off', ->
    @component.state.images[0].caption = 'Courtesy of The Guggenheim'
    @component.props.section.get('images')[0].caption.should.equal 'Courtesy of The Guggenheim'

  it 'renders an artwork', ->
    $(@component.getDOMNode()).html().should.containEql 'https://artsy.net/artwork.jpg'

  it 'renders artwork data', ->
    $(@component.getDOMNode()).html().should.containEql 'The Four Hedgehogs'
    $(@component.getDOMNode()).html().should.containEql 'Guggenheim'
    $(@component.getDOMNode()).html().should.containEql 'Van Gogh'

  it 'renders a preview', ->
    $(@component.getDOMNode()).html().should.containEql 'src="https://artsy.net/image.png" class="esis-preview-image"'
    $(@component.getDOMNode()).html().should.containEql '"https://artsy.net/artwork.jpg" class="esis-preview-image"'

  it 'displays the number of images in the preview', ->
    $(@component.getDOMNode()).html().should.containEql '2 Enter Slideshow'
