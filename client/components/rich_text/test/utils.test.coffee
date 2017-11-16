benv = require 'benv'
{ resolve } = require 'path'
sinon = require 'sinon'

describe 'Utils', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose
        $: benv.require 'jquery'
        Draft: require 'draft-js'
      window.jQuery = $
      window.pageYOffset = 500
      window.getSelection = sinon.stub().returns(
        getRangeAt: sinon.stub().returns(
          getClientRects: sinon.stub().returns([{
            bottom: 170
            height: 25
            left: 425
            right: 525
            top: 145
            width: 95
          }])
        )
      )
      global.Node = window.Node
      global.Element = window.Element
      global.HTMLElement = window.HTMLElement
      global.document = window.document
      @d =
        EditorState: Draft.EditorState
      copy = '<p>While auction houses will vouch for a piece’s authenticity, issues of title are the responsibility of the consignor.</p><p>Meaning there aren’t other people or organizations with a financial interest in the piece.</p>'
      @utils = benv.require resolve(__dirname, '../utils/index.coffee')
      @utils.__set__ 'getDefaultKeyBinding', @getDefaultKeyBinding = sinon.stub()
      @utils.__set__ 'KeyBindingUtil', @KeyBindingUtil = sinon.stub()
      @KeyBindingUtil.hasCommandModifier = sinon.stub().returns(true)
      @editorContent = @utils.convertFromRichHtml copy
      @editorState = @d.EditorState.createWithContent(@editorContent)
      done()

  afterEach ->
    benv.teardown()

  describe 'Custom text entities', ->

    describe '#setContentStartEnd', ->

      it 'Formats HTML via #setDropCap and #setContentEndMarker when feature', ->
        html = '<p>Here is text.</p>'
        @utils.setContentEndMarker = sinon.stub().returns(html)
        @utils.setContentStartEnd(html, 'feature', true, false)
        @utils.setContentEndMarker.called.should.be.ok

      it 'Formats HTML via #setContentEndMarker when standard', ->
        html = '<p>Here is text.</p>'
        @utils.setContentEndMarker = sinon.stub().returns(html)
        @utils.setContentStartEnd(html, 'standard', true, false)
        @utils.setContentEndMarker.called.should.not.be.ok

    describe '#setContentEndMarker', ->

      it 'Adds an end-marker if block isEndText', ->
        html = '<p>Here is text.</p>'
        doc = document.createElement('div')
        doc.innerHTML = html
        newHtml = @utils.setContentEndMarker doc, true
        newHtml.innerHTML.should.containEql '<span class="content-end"> </span>'

      it 'Removes end-marker if block not isEndText', ->
        html = '<p>Here is text.<span class="content-end"> </span></p>'
        doc = document.createElement('div')
        doc.innerHTML = html
        newHtml = @utils.setContentEndMarker doc, false
        newHtml.innerHTML.should.eql '<p>Here is text.</p>'
