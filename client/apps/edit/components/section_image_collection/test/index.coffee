_ = require 'underscore'
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

describe 'ImageCollection', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      $.fn.fillwidthLite = sinon.stub()
      @ImageCollection = benv.require resolve(__dirname, '../index')
      DisplayArtwork = benv.requireWithJadeify(
        resolve(__dirname, '../components/artwork')
        ['icons']
      )
      DisplayImage = benv.requireWithJadeify(
        resolve(__dirname, '../components/image')
        ['icons']
      )
      DisplayImage.__set__ 'RichTextCaption', sinon.stub()
      Controls = benv.require resolve(__dirname, '../components/controls')
      Controls.__set__ 'Autocomplete', sinon.stub()
      Controls.__set__ 'UrlArtworkInput', sinon.stub()
      @ImageCollection.__set__ 'DisplayArtwork', React.createFactory DisplayArtwork
      @ImageCollection.__set__ 'DisplayImage', React.createFactory DisplayImage
      @ImageCollection.__set__ 'Controls', React.createFactory Controls
      @ImageCollection.__set__ 'imagesLoaded', sinon.stub()
      @props = {
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
        setEditing: @setEditing = sinon.stub()
      }
      @component = ReactDOM.render React.createElement(@ImageCollection, @props), (@$el = $ "<div></div>")[0], =>
      @component.fillwidth = sinon.stub()
      @component.removeFillwidth = sinon.stub()
      done()

  afterEach ->
    benv.teardown()

  it 'renders an image collection component with preview', ->
    rendered = ReactDOMServer.renderToString React.createElement(@ImageCollection, @props)
    $(rendered).find('img').length.should.eql 2
    $(rendered).find('.esic-caption--display').css('display').should.equal 'block'
    $(rendered).find('.esic-caption--display').html().should.containEql '<p>Here is a caption</p>'

  it 'renders a placeholder if no images', ->
    @props.section.set 'images', []
    rendered = ReactDOMServer.renderToString React.createElement(@ImageCollection, @props)
    $(rendered).find('.esic-placeholder').html().should.containEql 'Add images and artworks above'

  it 'renders a progress indicator if progress', ->
    @component.setState progress: .5
    $(ReactDOM.findDOMNode(@component)).html().should.containEql '"upload-progress" style="width: 50%;"'

  it 'sets editing mode on click', ->
    r.simulate.click r.find @component, 'edit-section-image-container'
    @setEditing.called.should.eql true
    @setEditing.args[0][0].should.eql true

  it '#removeItem updates the images array', ->
    @component.removeItem(@props.section.get('images')[0])()
    @props.section.get('images').length.should.eql 1

  it '#onChange calls @fillwidth if > 1 image and layout overflow_fillwidth', ->
    @component.onChange()
    @component.fillwidth.called.should.eql true

  it '#onChange calls @removefillwidth if < 1 image and layout overflow_fillwidth', ->
    @component.props.section.set 'images', []
    @component.onChange()
    @component.removeFillwidth.called.should.eql true

  it '#onChange calls @removefillwidth if > 1 image and layout column_width', ->
    @component.props.section.set 'layout', 'column_width'
    @component.onChange()
    @component.removeFillwidth.called.should.eql true
