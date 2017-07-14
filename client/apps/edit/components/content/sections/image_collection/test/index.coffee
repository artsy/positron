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
      global.HTMLElement = () => {}
      window = {innerHeight: 800}
      @ImageCollection = benv.require resolve(__dirname, '../index')
      Artwork = benv.requireWithJadeify(
        resolve(__dirname, '../components/artwork')
        ['icons']
      )
      Image = benv.requireWithJadeify(
        resolve(__dirname, '../components/image')
        ['icons']
      )
      RichTextCaption = benv.requireWithJadeify(
        resolve(__dirname, '../../../../../../../components/rich_text_caption/index')
        ['icons']
      )
      Image.__set__ 'RichTextCaption', React.createFactory RichTextCaption
      Controls = benv.require resolve(__dirname, '../components/controls')
      Controls.__set__ 'Autocomplete', sinon.stub()
      Controls.__set__ 'UrlArtworkInput', sinon.stub()
      @ImageCollection.__set__ 'Artwork', React.createFactory Artwork
      @ImageCollection.__set__ 'Image', React.createFactory Image
      @ImageCollection.__set__ 'Controls', React.createFactory Controls
      @ImageCollection.__set__ 'imagesLoaded', sinon.stub().returns()
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
        channel: { hasFeature: hasFeature = sinon.stub().returns(true), isEditorial: sinon.stub().returns(true) }
      }
      @component = ReactDOM.render React.createElement(@ImageCollection, @props), (@$el = $ "<div></div>")[0], =>
      @component.onImagesLoaded = sinon.stub()
      done()

  afterEach ->
    benv.teardown()

  describe 'ImageCollection', ->

    it 'renders an image collection component with preview', ->
      $(ReactDOM.findDOMNode(@component)).find('img').length.should.eql 2
      $(ReactDOM.findDOMNode(@component)).html().should.containEql 'Here is a caption'
      $(ReactDOM.findDOMNode(@component)).html().should.containEql 'The Four Hedgehogs'

    it 'renders a placeholder if no images', ->
      @component.props.section.set 'images', []
      @component.forceUpdate()
      $(ReactDOM.findDOMNode(@component)).html().should.containEql 'Add images and artworks above'

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
      @component.onImagesLoaded.called.should.eql true

    it '#onChange calls @fillwidth', ->
      @component.onChange()
      @component.onImagesLoaded.called.should.eql true


  describe 'ImageSet', ->

    it 'renders an image set component with preview', ->
      @component.props.section.unset 'layout'
      @component.props.section.set 'type', 'image_set'
      @component.forceUpdate()
      $(ReactDOM.findDOMNode(@component)).html().should.containEql 'imageset-preview'
      $(ReactDOM.findDOMNode(@component)).find('img').length.should.eql 2
      $(ReactDOM.findDOMNode(@component)).find('svg').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).html().should.not.containEql 'Here is a caption'
      $(ReactDOM.findDOMNode(@component)).html().should.not.containEql 'The Four Hedgehogs'

    it 'renders an image set edit view', ->
      @props.editing = true
      @props.section.set 'type', 'image_set'
      component = ReactDOM.render React.createElement(@ImageCollection, @props), (@$el = $ "<div></div>")[0]
      $(ReactDOM.findDOMNode(component)).html().should.containEql '<div class="drag-container">'

    it 'adds classes to image sets with many images', ->
      images = [
        {
          type: 'image'
          url: 'https://artsy.net/image.png'
          caption: '<p>Here is a caption</p>'
        },
        {
          type: 'image'
          url: 'https://artsy.net/image.png'
          caption: '<p>Here is a caption</p>'
        },
        {
          type: 'image'
          url: 'https://artsy.net/image.png'
          caption: '<p>Here is a caption</p>'
        },
        {
          type: 'image'
          url: 'https://artsy.net/image.png'
          caption: '<p>Here is a caption</p>'
        }
      ]
      @props.editing = true
      @props.section.set
        images: images
        type: 'image_set'
      component = ReactDOM.render React.createElement(@ImageCollection, @props), (@$el = $ "<div></div>")[0]
      $(ReactDOM.findDOMNode(component)).attr('class').should.containEql 'imageset-block'


  describe '#getFillWidthSizes', ->

    it 'returns expected container and target for overflow_fillwidth', ->
      sizes = @component.getFillWidthSizes()
      sizes.containerSize.should.eql 860
      sizes.targetHeight.should.eql 537.5999999999999

    it 'returns expected container and target for column_width', ->
      @component.props.section.set 'layout', 'column_width'
      sizes = @component.getFillWidthSizes()
      sizes.containerSize.should.eql 580
      sizes.targetHeight.should.eql 537.5999999999999

    it 'returns expected container and target for image_set with many images', ->
      @component.props.section.unset 'layout'
      @component.props.section.set 'type', 'image_set'
      @component.props.section.set 'images', ['img', 'img', 'img', 'img']
      sizes = @component.getFillWidthSizes()
      sizes.containerSize.should.eql 860
      sizes.targetHeight.should.eql 400
