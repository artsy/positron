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

describe 'SectionImageCollection', ->

  beforeEach (done) ->
    global.Image = class Image
      constructor: ->
        setTimeout => @onload()
      onload: ->
      width: 120
      height: 90
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      SectionImageCollection = benv.requireWithJadeify(
        resolve(__dirname, '../index'), ['icons']
      )
      SectionImageCollection.__set__ 'gemup', @gemup = sinon.stub()
      SectionImageCollection.__set__ 'imagesLoaded', sinon.stub()
      SectionImageCollection.__set__ 'Autocomplete', sinon.stub()
      SectionImageCollection.__set__ 'Input', sinon.stub()
      SectionImageCollection.__set__ 'resize', (url)-> url
      @component = React.render SectionImageCollection(
        section: new Backbone.Model
          type: 'image_collection'
          images: [
            {
              type: 'image'
              url: 'https://artsy.net/image.png'
              caption: '<p>Here is a caption</p>'
            }
            {
              type: 'artwork'
              title: 'The Four Hedgehogs'
              id: '123'
              image: 'https://artsy.net/artwork.jpg'
              partner: name: 'Guggenheim'
              artists: [
                {name: 'Van Gogh'}
              ]
            }
          ]
        editing: false
        setEditing: -> ->
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub @component, 'setState'
        sinon.stub Backbone, 'sync'
        sinon.stub @component, 'removeItem'
        sinon.stub $, 'ajax'
        done()

  afterEach ->
    $.ajax.restore()
    Backbone.sync.restore()
    benv.teardown()
    delete global.Image

  it 'saves image info after upload', (done) ->
    @component.upload target: files: ['foo']
    @gemup.args[0][1].done('fooza')
    setTimeout =>
      @component.setState.args[0][0].images[2].type.should.equal 'image'
      @component.props.section.get('images')[2].url.should.equal 'fooza'
      @component.props.section.get('images')[2].width.should.equal 120
      @component.props.section.get('images')[2].height.should.equal 90
      done()

  it 'renders an image', ->
    $(@component.getDOMNode()).html().should.containEql 'https://artsy.net/image.png'

  it 'renders an artwork', ->
    $(@component.getDOMNode()).html().should.containEql 'https://artsy.net/artwork.jpg'

  it 'renders artwork data', ->
    $(@component.getDOMNode()).html().should.containEql 'The Four Hedgehogs'
    $(@component.getDOMNode()).html().should.containEql 'Guggenheim'
    $(@component.getDOMNode()).html().should.containEql 'Van Gogh'

  it 'renders a preview', ->
    $(@component.getDOMNode()).find('img').length.should.equal 2
    $(@component.getDOMNode()).find('.esic-caption--display').css('display').should.equal 'block'
    $(@component.getDOMNode()).find('.esic-caption--display').html().should.containEql '<p>Here is a caption</p>'
