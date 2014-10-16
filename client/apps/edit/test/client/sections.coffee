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
        { @init, @SectionTool, @TextSection } = require '../../client/sections'
        @tree = @init
          el: $('#edit-sections')
          sections: @article.get('sections')
        , -> setTimeout -> done()

  afterEach ->
    benv.teardown()

  describe 'SectionList', ->

    it 'renders the sections', ->
      $('#edit-sections').html().should.containEql '10. Lisson Gallery'

  describe 'SectionTool', ->

    it 'opens on click', (done) ->
      r.simulate.click r.find @tree, 'edit-section-tool-icon'
      $('.edit-section-tool').attr('data-state-open').should.equal 'true'
      done()

    it 'adds a new text section when clicking on it', ->
      # Getting "Cannot render markup in a Worker thread.
      # This is likely a bug in the framework" without stubbing onNewSection
      sinon.stub @tree.refs.tool.props, 'onNewSection'
      r.simulate.click r.find @tree, 'edit-section-tool-text'
      _.last(@tree.props.sections).type.should.equal 'text'
      _.last(@tree.props.sections).body.should.equal '.'
      @tree.refs.tool.props.onNewSection.restore()

  describe 'TextSection', ->

    beforeEach (done) ->
      @component = React.renderComponent @TextSection(
        section: { body: 'Foo to the bar' }
      ), document.body, -> setTimeout -> done()

    it 'opens edit mode on click', ->
      r.simulate.click r.find @component, 'edit-section-text'
      @component.state.editing.should.be.ok

    it "updates the section's body on keyup", ->
      r.simulate.keyUp r.find(@component, 'invisible-input'), target: value: 'Hello'
      @component.props.section.body.should.equal 'Hello'