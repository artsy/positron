benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
r =
  find: ReactTestUtils.scryRenderedDOMComponentsWithClass
  simulate: ReactTestUtils.Simulate

describe 'ImageUpload', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      window.jQuery = $
      @ImageUpload = benv.require resolve __dirname, '../components/image_upload.coffee'
      @ImageUpload.__set__ 'gemup', @gemup = sinon.stub()
      @props = {
        size: 10
        onChange: sinon.stub()
        name: 'my_image'
        }

      @component = ReactDOM.render React.createElement(@ImageUpload, @props), (@$el = $ "<div></div>")[0], =>
        setTimeout =>
          done()

  afterEach ->
    benv.teardown()


  describe 'Display', ->

    it 'Renders the file input', ->
      $(ReactDOM.findDOMNode(@component)).find('input[type=file]').length.should.eql 1

    it 'Renders an image preview if image is present', ->
      @component.setState src: 'http://artsy.net/image.jpg'
      $(ReactDOM.findDOMNode(@component)).html().should.containEql 'background-image: url(http://artsy.net/image.jpg)'

    it 'Disables the file input if prop includes disabled', ->
      @props['disabled'] = true
      @component = ReactDOM.render React.createElement(@ImageUpload, @props), (@$el = $ "<div></div>")[0]
      $(ReactDOM.findDOMNode(@component)).hasClass('disabled').should.eql true
      $(ReactDOM.findDOMNode(@component)).find('input[type=file]').prop('disabled').should.eql true

    it 'Renders a progress bar if progress', ->
      @component.setState progress: .5
      $(ReactDOM.findDOMNode(@component)).find('.upload-progress-container').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('.upload-progress').css('width').should.eql '50%'


  describe '#upload', ->

    it 'displays error when image is too large', ->
      @component.upload target: files: [{size: 40000000, type:"image/jpeg", src: 'foo'}]
      @component.state.error.should.eql true
      @component.state.errorType.should.eql 'size'
      $(ReactDOM.findDOMNode(@component)).html().should.containEql 'File is too large'

    it 'displays error when image type is incorrect', ->
      @component.upload target: files: [{size: 300000, type: 'image/tiff'}]
      @component.state.error.should.eql true
      @component.state.errorType.should.eql 'type'
      $(ReactDOM.findDOMNode(@component)).html().should.containEql 'Please choose .png, .jpg, or .gif'

    it 'uploads to gemini', ->
      @component.upload target: files: [{size: 300000, type: 'image/jpg', src: 'foo'}]
      @gemup.args[0][0].src.should.equal 'foo'


  describe '#onRemove', ->

    it 'removes the state and callsback', ->
      @component.setState src: 'http://artsy.net/image.jpg'
      r.simulate.click r.find(@component, 'image-upload-form-remove')[0]
      @component.state.src.should.eql ''
      @component.props.onChange.args[0].should.eql [ '', 'my_image' ]
