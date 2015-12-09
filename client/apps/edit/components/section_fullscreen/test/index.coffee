benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
require 'react/addons'
{ div } = React.DOM
fixtures = require '../../../../../../test/helpers/fixtures'

describe 'SectionFullscreen', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose
        $: benv.require 'jquery'
      SectionFullscreen = benv.requireWithJadeify(
        resolve(__dirname, '../index'), ['icons']
      )
      SectionFullscreen.__set__ 'gemup', @gemup = sinon.stub()
      @component = React.render SectionFullscreen(
        section: new Backbone.Model
          type: 'fullscreen'
          intro: ''
          title: ''
          background_url: ''
        editing: false
        setEditing: -> ->
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub @component, 'setState'
        done()

  afterEach ->
    benv.teardown()

  it 'removes itself when the section is empty', ->
    @component.props.section.destroy = sinon.stub()
    @component.state = {}
    @component.onClickOff()
    @component.props.section.destroy.called.should.be.ok

  it 'uploads to gemini', (done) ->
    @component.upload target: files: ['foo']
    @gemup.args[0][0].should.equal 'foo'
    @gemup.args[0][1].done('fooza')
    setTimeout =>
      @component.setState.args[0][0].background_url.should.equal 'fooza'
      done()

  it 'saves the url after upload', (done) ->
    sinon.stub @component, 'onClickOff'
    @component.upload target: files: ['foo']
    @gemup.args[0][1].done('fooza')
    setTimeout =>
      @component.onClickOff.called.should.be.ok
      done()

  it 'sets title state on keyup', ->
    $(@component.refs.editableTitle.getDOMNode()).html('foobar')
    @component.onEditableKeyup()
    @component.setState.args[0][0].title.should.equal 'foobar'

  it 'sets intro state on keyup', ->
    $(@component.refs.editableIntro.getDOMNode()).html('foobar')
    @component.onEditableKeyup()
    @component.setState.args[0][0].intro.should.equal 'foobar'

  it 'saves titles on click off', ->
    @component.state.title = 'foobar'
    @component.onClickOff()
    @component.props.section.get('title').should.equal 'foobar'

  it 'saves intros on click off', ->
    @component.state.intro = 'foobar'
    @component.onClickOff()
    @component.props.section.get('intro').should.equal 'foobar'
