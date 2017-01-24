benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
require 'react/addons'
r =
  find: React.addons.TestUtils.findRenderedDOMComponentWithClass
  simulate: React.addons.TestUtils.Simulate
{ div } = React.DOM

describe 'SectionList', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      SectionList = benv.require resolve(__dirname, '../index')
      SectionList.__set__ 'SectionTool', @SectionTool = sinon.stub()
      SectionList.__set__ 'SectionContainer', @SectionContainer = sinon.stub()
      @component = React.render SectionList(
        sections: @sections = new Backbone.Collection [
          { body: 'Foo to the bar', type: 'text' }
          { body: 'Foo to the bar', type: 'text' }
          { type: 'image', url: 'http://artsy.net/image.jpg', caption: '<p>An image caption</p>', layout: 'column_width'}
          {
            type: 'artworks'
            layout: 'overflow_fillwidth'
            ids: [
                "568eda976428704baf0001b8",
                "568eda927076d0705d000204"
            ]
            artworks: [
                {
                    id: "568eda976428704baf0001b8",
                    slug: "rodrigo-valenzuela-hedonic-reversal-no-13-1",
                    date: "2014",
                    title: "Hedonic Reversal No. 13",
                    image: "https://d32dm0rphc51dk.cloudfront.net/p1OpunHRxT3_0__lSxw_8g/larger.jpg",
                    partner: {
                        name: "envoy enterprises",
                        slug: "envoy-enterprises"
                    },
                    artist: {
                        name: "Rodrigo Valenzuela",
                        slug: "rodrigo-valenzuela"
                    }
                },
                {
                    id: "568eda927076d0705d000204",
                    slug: "rodrigo-valenzuela-hedonic-reversal-no-12-1",
                    date: "2014",
                    title: "Hedonic Reversal No. 12",
                    image: "https://d32dm0rphc51dk.cloudfront.net/HG8Usf5i3O5tZbBSzKn9Ew/larger.jpg",
                    partner: {
                        name: "envoy enterprises",
                        slug: "envoy-enterprises"
                    },
                    artist: {
                        name: "Rodrigo Valenzuela 2",
                        slug: "rodrigo-valenzuela-2"
                    }
                }
            ]
          }
        ]
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
        @component.setState = sinon.stub()
        @component.props.sections.off()
        done()

  afterEach ->
    benv.teardown()

  xit 'renders the sections', ->
    @$el.html().should.containEql 'Foo to the bar'

  it 'converts image components to image_collection', ->
    @SectionContainer.args[2][0].section.attributes.type.should.equal 'image_collection'
    @SectionContainer.args[2][0].section.attributes.images[0].type.should.equal 'image'
    @SectionContainer.args[2][0].section.attributes.images[0].url.should.equal 'http://artsy.net/image.jpg'

  it 'converts artwork components to image_collection', ->
    @SectionContainer.args[3][0].section.attributes.type.should.equal 'image_collection'
    @SectionContainer.args[3][0].section.attributes.images[0].type.should.equal 'artwork'
    @SectionContainer.args[3][0].section.attributes.images[0].artist.slug.should.equal 'rodrigo-valenzuela'
    @SectionContainer.args[3][0].section.attributes.images[1].artist.slug.should.equal 'rodrigo-valenzuela-2'

  it 'sets an index for the section tools', ->
    @SectionTool.args[0][0].index.should.equal -1
    @SectionTool.args[1][0].index.should.equal 0
    @SectionTool.args[2][0].index.should.equal 1

  it 'opens editing mode in the last added section', ->
    @component.onNewSection @component.props.sections.last()
    @component.setState.args[0][0].editingIndex.should.equal 3

  it 'toggles editing state when a child section callsback', ->
    @SectionContainer.args[0][0].onSetEditing
      .should.equal @component.onSetEditing

  it 'uses the section cid as a key b/c they have to be unique AND a \
      property specific to that piece of data, or model in our case', ->
    @component.render()
    @SectionContainer.args[0][0].key.should.equal @sections.at(0).cid
    @SectionContainer.args[1][0].key.should.equal @sections.at(1).cid
