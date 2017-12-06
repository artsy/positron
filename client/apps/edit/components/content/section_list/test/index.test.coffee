benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
ReactDOMServer = require 'react-dom/server'
Sections = require '../../../../../../collections/sections.coffee'
Channel = require '../../../../../../models/channel.coffee'
r =
  find: ReactTestUtils.scryRenderedDOMComponentsWithClass
  simulate: ReactTestUtils.Simulate

describe 'SectionList', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      global.HTMLElement = () => {}
      global.Image = () => {}
      window.matchMedia = sinon.stub().returns(
        {
          matches: false
          addListener: sinon.stub()
          removeListener: sinon.stub()
        }
      )
      @SectionList = benv.require resolve(__dirname, '../index')
      @SectionTool = benv.require resolve(__dirname, '../../section_tool/index.jsx')
      DragContainer = benv.require resolve(__dirname, '../../../../../../components/drag_drop/index')
      Paragraph = benv.require resolve(
        __dirname, '../../../../../../components/rich_text/components/paragraph.coffee'
      )
      @SectionList.__set__ 'SectionTool', @SectionTool
      @SectionContainer = benv.require resolve(__dirname, '../../section_container/index')
      @ImageCollection = benv.require(
        resolve(__dirname, '../../sections/image_collection/index')
      )
      @ImageCollection.__set__ 'imagesLoaded', sinon.stub().returns()
      @SectionContainer.__set__ 'Text', text = sinon.stub()
      @SectionContainer.__set__ 'ImageCollection', React.createFactory @ImageCollection
      @SectionList.__set__ 'SectionContainer', React.createFactory @SectionContainer
      @SectionList.__set__ 'DragContainer', React.createFactory DragContainer
      @SectionList.__set__ 'Paragraph', React.createFactory Paragraph
      @props = {
        sections: @sections = new Sections [
          { body: 'Foo to the bar', type: 'text' }
          { body: 'Foo to the bar', type: 'text' }
          {
            type: 'image_collection'
            images: [
              {
                url: 'http://artsy.net/image.jpg'
                caption: '<p>An image caption</p>'
              }
            ]
            layout: 'column_width'
          }
          {
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
          }
        ]
        article: new Backbone.Model {
          layout: 'feature'
          sections: @sections
        }
        saveArticle: @saveArticle = sinon.stub()
        channel: new Channel
          type: 'editorial'
      }
      @component = ReactDOM.render React.createElement(@SectionList, @props ), (@$el = $ "<div></div>")[0], => setTimeout =>
        done()

  afterEach ->
    benv.teardown()

  it 'renders the sections', ->
    @component.render()
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'The Four Hedgehogs'

  it 'renders the postscript on editorial channels', ->
    @component.render()
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'Postscript (optional)'

  it 'does not render the postscript on non-editorial channels', ->
    @props.channel.set 'type', 'partner'
    component = ReactDOM.render React.createElement(@SectionList, @props), ($el = $ "<div></div>")[0], =>
    component.render()
    $(ReactDOM.findDOMNode(component)).html().should.not.containEql 'Postscript (optional)'

  it 'opens editing mode in the last added section', ->
    @component.setState = sinon.stub()
    @component.onNewSection @component.props.sections.last()
    @component.setState.args[0][0].editingIndex.should.equal 3

  it 'toggles editing state when a child section callsback', ->
    @SectionList.__set__ 'SectionContainer', sectionContainer = sinon.stub()
    component = ReactDOM.render React.createElement(@SectionList, @props ), (@$el = $ "<div></div>")[0], =>
    sectionContainer.args[0][0].onSetEditing
      .should.equal component.onSetEditing

  it 'uses the section cid as a key b/c they have to be unique AND a \
      property specific to that piece of data, or model in our case', ->
    @SectionList.__set__ 'SectionContainer', sectionContainer = sinon.stub()
    component = ReactDOM.render React.createElement(@SectionList, @props ), (@$el = $ "<div></div>")[0], =>
    component.render()
    sectionContainer.args[0][0].key.should.equal @sections.at(0).cid
    sectionContainer.args[1][0].key.should.equal @sections.at(1).cid

  it 'onRemoveSection removes sections from the article', ->
    r.simulate.click r.find(@component, 'edit-section__remove')[0]
    @component.props.sections.length.should.eql 3

  it 'onRemoveSection resets the article sections if empty', ->
    @props.sections = new Sections [{ body: 'Foo to the bar', type: 'text' }]
    @props.article = new Backbone.Model {sections: @props.sections}
    component = ReactDOM.render React.createElement(@SectionList, @props ), ($el = $ "<div></div>")[0], =>
    component.render()
    r.simulate.click r.find(component, 'edit-section__remove')[0]
    @props.article.get('sections').length.should.eql 0

  it '#setPostscript sets the postscript and saves article', ->
    @component.setPostscript '<p>Here is a new postscript.</p>'
    @component.props.article.get('postscript').should.eql '<p>Here is a new postscript.</p>'
    @saveArticle.called.should.eql true

  it '#setPostscript does not save empty html', ->
    @component.setPostscript '<p></p>'
    @saveArticle.called.should.eql true
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'Postscript (optional)'
