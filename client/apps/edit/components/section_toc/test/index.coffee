benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
require 'react/addons'

describe 'SectionToc', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      SectionToc = benv.require resolve(__dirname, '../index')
      @component = React.render SectionToc(
        section: new Backbone.Model { links: [ { name: 'andy', value: 'Andy' } ] , type: 'toc' }
        onSetEditing: @onSetEditing = sinon.stub()
        setEditing: @setEditing = sinon.stub()
        editing: false
        key: 4
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
        @component.setState = sinon.stub()
        done()

  afterEach ->
    benv.teardown()

  it 'renders the toc', ->
    @$el.html().should.containEql '<a href="#Andy"'
