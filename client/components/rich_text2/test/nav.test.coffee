benv = require 'benv'
sinon = require 'sinon'
Backbone = require 'backbone'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
ReactDOMServer = require 'react-dom/server'
r =
  find: ReactTestUtils.scryRenderedDOMComponentsWithClass
  simulate: ReactTestUtils.Simulate

{ blockTypes,
  inlineStyles } = require '../../../apps/edit/components/content2/sections/text/draft_config.js'

describe 'RichText: Nav', ->

  describe 'Classic: partner', ->
    beforeEach (done) ->
      benv.setup =>
        benv.expose $: benv.require 'jquery'
        @Nav = benv.requireWithJadeify(
          resolve(__dirname, '../components/nav'), ['icons']
        )
        @props = {
          hasFeatures: false
          blocks: blockTypes('classic')
          toggleBlock: @toggleBlock = sinon.stub()
          styles: inlineStyles('classic')
          toggleStyle: @toggleStyle = sinon.stub()
          promptForLink: @promptForLink = sinon.stub()
          makePlainText: @makePlainText = sinon.stub()
          position: { top: 20, left: 20 }
        }
        @component = ReactDOM.render React.createElement(@Nav, @props), (@$el = $ "<div></div>")[0], => setTimeout =>
          done()

    afterEach ->
      benv.teardown()

    it 'renders correct number of menu items', ->
      @component.render()
      $(ReactDOM.findDOMNode(@component)).find('button').length.should.eql 8

    it 'renders correct block buttons', ->
      $(ReactDOM.findDOMNode(@component)).find('button.header-two').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('button.header-three').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('button.unordered-list-item').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('button.ordered-list-item').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('button.header-one').length.should.eql 0
      $(ReactDOM.findDOMNode(@component)).find('button.blockquote').length.should.eql 0

    it 'renders style buttons', ->
      $(ReactDOM.findDOMNode(@component)).find('button.ITALIC').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('button.BOLD').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('button.STRIKETHROUGH').length.should.eql 0

    it 'renders link button', ->
      $(ReactDOM.findDOMNode(@component)).find('button.link').length.should.eql 1

    it 'renders plain-text button', ->
      $(ReactDOM.findDOMNode(@component)).find('button.remove-formatting').length.should.eql 1

    it 'can toggle block styles', ->
      r.simulate.mouseDown r.find(@component, 'header-two')[0]
      @toggleBlock.called.should.eql true

    it 'can toggle inline styles', ->
      r.simulate.mouseDown r.find(@component, 'BOLD')[0]
      @toggleStyle.called.should.eql true

    it 'can call for link prompt', ->
      r.simulate.mouseDown r.find(@component, 'link')[0]
      @promptForLink.called.should.eql true

    it 'can call makePlainText', ->
      r.simulate.mouseDown r.find(@component, 'remove-formatting')[0]
      @makePlainText.called.should.eql true

  describe 'Classic: team-channel', ->
    beforeEach (done) ->
      benv.setup =>
        benv.expose $: benv.require 'jquery'
        @Nav = benv.requireWithJadeify(
          resolve(__dirname, '../components/nav'), ['icons']
        )
        @props = {
          hasFeatures: true
          blocks: blockTypes('classic', true)
          toggleBlock: @toggleBlock = sinon.stub()
          styles: inlineStyles('classic', true)
          toggleStyle: @toggleStyle = sinon.stub()
          promptForLink: @promptForLink = sinon.stub()
          makePlainText: @makePlainText = sinon.stub()
          position: { top: 20, left: 20 }
        }
        @component = ReactDOM.render React.createElement(@Nav, @props), (@$el = $ "<div></div>")[0], => setTimeout =>
          done()

    afterEach ->
      benv.teardown()

    it 'renders correct number of menu items', ->
      $(ReactDOM.findDOMNode(@component)).find('button').length.should.eql 10

    it 'renders correct block buttons', ->
      $(ReactDOM.findDOMNode(@component)).find('button.header-two').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('button.header-three').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('button.blockquote').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('button.unordered-list-item').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('button.ordered-list-item').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('button.header-one').length.should.eql 0

    it 'renders style buttons', ->
      $(ReactDOM.findDOMNode(@component)).find('button.ITALIC').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('button.BOLD').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('button.STRIKETHROUGH').length.should.eql 0

    it 'renders the artist button', ->
      $(ReactDOM.findDOMNode(@component)).find('button.artist').length.should.eql 1

    it 'can call for artist link prompt', ->
      r.simulate.mouseDown r.find(@component, 'artist')[0]
      @promptForLink.called.should.eql true
      @promptForLink.args[0][0].should.eql 'artist'

  describe 'Standard', ->
    beforeEach (done) ->
      benv.setup =>
        benv.expose $: benv.require 'jquery'
        @Nav = benv.requireWithJadeify(
          resolve(__dirname, '../components/nav'), ['icons']
        )
        @props = {
          hasFeatures: true
          blocks: blockTypes('standard', true)
          toggleBlock: @toggleBlock = sinon.stub()
          styles: inlineStyles('standard', true)
          toggleStyle: @toggleStyle = sinon.stub()
          promptForLink: @promptForLink = sinon.stub()
          makePlainText: @makePlainText = sinon.stub()
          position: { top: 20, left: 20 }
        }
        @component = ReactDOM.render React.createElement(@Nav, @props), (@$el = $ "<div></div>")[0], => setTimeout =>
          done()

    afterEach ->
      benv.teardown()

    it 'renders correct number of menu items', ->
      $(ReactDOM.findDOMNode(@component)).find('button').length.should.eql 10

    it 'renders correct block buttons', ->
      $(ReactDOM.findDOMNode(@component)).find('button.header-two').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('button.header-three').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('button.blockquote').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('button.unordered-list-item').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('button.ordered-list-item').length.should.eql 0
      $(ReactDOM.findDOMNode(@component)).find('button.header-one').length.should.eql 0

    it 'renders style buttons', ->
      $(ReactDOM.findDOMNode(@component)).find('button.ITALIC').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('button.BOLD').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('button.STRIKETHROUGH').length.should.eql 1

    it 'renders the artist button', ->
      $(ReactDOM.findDOMNode(@component)).find('button.artist').length.should.eql 1

    it 'renders link button', ->
      $(ReactDOM.findDOMNode(@component)).find('button.link').length.should.eql 1

    it 'renders plain-text button', ->
      $(ReactDOM.findDOMNode(@component)).find('button.remove-formatting').length.should.eql 1

  describe 'Feature', ->
    beforeEach (done) ->
      benv.setup =>
        benv.expose $: benv.require 'jquery'
        @Nav = benv.requireWithJadeify(
          resolve(__dirname, '../components/nav'), ['icons']
        )
        @props = {
          hasFeatures: true
          blocks: blockTypes('feature', true)
          toggleBlock: @toggleBlock = sinon.stub()
          styles: inlineStyles('feature', true)
          toggleStyle: @toggleStyle = sinon.stub()
          promptForLink: @promptForLink = sinon.stub()
          makePlainText: @makePlainText = sinon.stub()
          position: { top: 20, left: 20 }
        }
        @component = ReactDOM.render React.createElement(@Nav, @props), (@$el = $ "<div></div>")[0], => setTimeout =>
          done()

    afterEach ->
      benv.teardown()

    it 'renders correct number of menu items', ->
      $(ReactDOM.findDOMNode(@component)).find('button').length.should.eql 10

    it 'renders correct block buttons', ->
      $(ReactDOM.findDOMNode(@component)).find('button.header-one').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('button.header-two').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('button.header-three').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('button.blockquote').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('button.unordered-list-item').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('button.ordered-list-item').length.should.eql 0

    it 'renders style buttons', ->
      $(ReactDOM.findDOMNode(@component)).find('button.ITALIC').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('button.BOLD').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('button.STRIKETHROUGH').length.should.eql 0

    it 'renders the artist button', ->
      $(ReactDOM.findDOMNode(@component)).find('button.artist').length.should.eql 1
