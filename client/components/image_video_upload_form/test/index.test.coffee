_ = require 'underscore'
benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
fixtures = require '../../../../test/helpers/fixtures'
{ resolve } = require 'path'

describe 'ImageVideoUploadForm', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require('jquery')
      Backbone.$ = $
      ImageVideoUploadForm = benv.requireWithJadeify(
        resolve(__dirname, '../index')
        ['formTemplate']
      )
      ImageVideoUploadForm.__set__ 'gemup', @gemup = sinon.stub()
      global.confirm ?= -> true
      @view = new ImageVideoUploadForm
        el: $('body')
        remove: @remove = sinon.stub()
      done()

  afterEach ->
    benv.teardown()

  describe '#upload', ->

    it 'displays error when image is too large', ->
      @view.upload target: files: [{size: 40000000, type: 'image/jpg'}]
      $('.image-upload-form').attr('data-error').should.equal 'size'

    it 'displays error when image type is incorrect', ->
      @view.upload target: files: [{size: 300000, type: 'image/tiff'}]
      $('.image-upload-form').attr('data-error').should.equal 'type'

    it 'uploads to gemini', ->
      @view.upload target: files: [{size: 300000, type: 'image/jpg', src: 'foo'}]
      @gemup.args[0][0].src.should.equal 'foo'

    it 'shows a video preview when upload is mp4', (done) ->
      @view.upload target: files: [{size: 400000, type: 'video/mp4', src: 'foo.mp4'}]
      @gemup.args[0][0].src.should.equal 'foo.mp4'
      @gemup.args[0][1].done('foo.mp4')
      setTimeout =>
        $('.image-upload-form-preview source').attr('src').should.equal 'foo.mp4'
        done()

  describe '#onRemove', ->

    it 'removes the state and callsback', ->
      @view.onRemove preventDefault: ->
      @view.$('.image-upload-form').attr('data-state').should.equal ''
      @remove.called.should.be.ok
