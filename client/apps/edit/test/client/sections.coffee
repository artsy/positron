_ = require 'underscore'
benv = require 'benv'
sinon = require 'sinon'
Article = require '../../../../models/article'
Backbone = require 'backbone'
fixtures = require '../../../../../test/helpers/fixtures'
{ resolve } = require 'path'
React = require 'react'
require 'react/addons'
r =
  find: React.addons.TestUtils.findRenderedDOMComponentWithClass
  simulate: React.addons.TestUtils.Simulate

describe 'EditSections', ->

  beforeEach (done) ->
    benv.setup =>
      tmpl = resolve __dirname, '../../templates/index.jade'
      benv.render tmpl, _.extend(fixtures().locals,
        article: @article = new Article fixtures().articles
      ), =>
        benv.expose $: require('jquery')
        { @init, @SectionTool, @TextSection,
          @SectionHoverControls } = benv.requireWithJadeify(
          resolve(__dirname, '../../client/sections'), ['icons']
        )
        @tree = @init
          el: $('#edit-sections')
          sections: @article.sections
        , -> setTimeout -> done()
        # Getting "Cannot render markup in a Worker thread.
        # This is likely a bug in the framework" without stubbing onNewSection
        sinon.stub @tree, 'setState'

  afterEach ->
    @tree.setState.restore()
    benv.teardown()

  describe 'SectionList', ->

    it 'renders the sections', ->
      $('#edit-sections').html().should.containEql '10. Lisson Gallery'

    it 'opens editing mode in the last added section', ->
      @tree.props.sections.add { body: 'Hello World', type: 'text' }
      @tree.setState.args[0][0].editingIndex.should.equal 5

    it 'toggles editing state when a child section callsback', ->
      @tree.refs.text1.props.onToggleEditMode 2
      @tree.setState.args[0][0].editingIndex.should.equal 2

  describe 'SectionTool', ->

    it 'opens on click', (done) ->
      r.simulate.click r.find @tree, 'edit-section-tool-icon'
      $('.edit-section-tool').attr('data-state-open').should.equal 'true'
      done()

    it 'adds a new text section when clicking on it', ->
      r.simulate.click r.find @tree, 'edit-section-tool-text'
      @tree.props.sections.last().get('type').should.equal 'text'
      @tree.props.sections.last().get('body').should.equal ''

  describe 'TextSection', ->

    beforeEach (done) ->
      @component = React.renderComponent @TextSection(
        section: new Backbone.Model { body: 'Foo to the bar' }
        onToggleEditMode: @onToggleEditMode = sinon.stub()
        editing: false
        key: 4
      ), $("<div></div>")[0], -> setTimeout -> done()

    it "updates the section's body on keyup", ->
      input = r.find(@component, 'invisible-input')
      r.simulate.keyUp input, target: value: 'Hello'
      @component.props.section.get('body').should.equal 'Hello'

    it 'calls back to set the editing state upstream', ->
      r.simulate.click r.find @component, 'edit-section-text'
      @onToggleEditMode.args[0][0].should.equal 4

    it 'removes the section if they click off and its empty', ->
      @component.props.section.destroy = sinon.stub()
      @component.props.section.set body: ''
      @component.onClickOff()
      @component.props.section.destroy.called.should.be.ok

  describe 'SectionHoverControls', ->

    beforeEach (done) ->
      @component = React.renderComponent @SectionHoverControls(
        section: new Backbone.Model { body: 'Foo to the bar' }
        toggleEditMode: @toggleEditMode = sinon.stub()
      ), $("<div></div>")[0], -> setTimeout -> done()

    it 'can delete a section', ->
      @component.props.section.destroy = sinon.stub()
      r.simulate.click r.find(@component, 'edit-section-remove')
      @component.props.section.destroy.called.should.be.ok
