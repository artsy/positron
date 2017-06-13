benv = require 'benv'
{ resolve } = require 'path'
sinon = require 'sinon'

describe 'Utils', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose
        $: benv.require 'jquery'
      window.jQuery = $
      @utils = benv.require resolve(__dirname, '../utils/index.coffee')
      @utils.__set__ 'getDefaultKeyBinding', @getDefaultKeyBinding = sinon.stub()
      @utils.__set__ 'KeyBindingUtil', @KeyBindingUtil = sinon.stub()
      @KeyBindingUtil.hasCommandModifier = sinon.stub().returns(true)
      done()

  afterEach ->
    benv.teardown()

  describe '#stripGoogleStyles', ->

    it 'removes non-breaking spaces between paragraphs', ->
      html = '<p>hello</p><br><p>here again.</p><br class="Apple-interchange-newline">'
      @utils.stripGoogleStyles(html).should.eql '<p>hello</p><p>here again.</p>'

    it 'removes non-breaking spaces between paragraphs', ->
      html = '<p>hello</p><br><p>here again.</p><br class="Apple-interchange-newline">'
      @utils.stripGoogleStyles(html).should.eql '<p>hello</p><p>here again.</p>'

    it 'removes dummy b tags google docs wraps document in', ->
      html = '<b style="font-weight:normal;" id="docs-internal-guid-ce2bb19a-cddb-9e53-cb18-18e71847df4e"><p><span style="font-size:11pt;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">Available at: Espacio Valverde • Galleries Sector, Booth 9F01</span></p>'
      @utils.stripGoogleStyles(html).should.eql '<p><span style="font-size:11pt;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">Available at: Espacio Valverde • Galleries Sector, Booth 9F01</span></p>'

    it 'replaces bold spans with actual b tags', ->
      html = '<p><span style="font-size:11pt;color:#000000;background-color:transparent;font-weight:700;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">B. 1981 in Madrid. Lives and works in Madrid.</span></p>'
      @utils.stripGoogleStyles(html).should.eql '<p><span><strong>B. 1981 in Madrid. Lives and works in Madrid.</strong></span></p>'

    it 'replaces italic spans with actual em tags', ->
      html = '<p><span style="font-size:11pt;color:#000000;background-color:transparent;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">B. 1981 in Madrid. Lives and works in Madrid.</span></p>'
      @utils.stripGoogleStyles(html).should.eql '<p><span><em>B. 1981 in Madrid. Lives and works in Madrid.</em></span></p>'

    it 'replaces spans that are bold and italic', ->
      html = '<p><span style="font-size:11pt;color:#000000;background-color:transparent;font-weight:700;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">B. 1981 in Madrid. Lives and works in Madrid.</span></p>'
      @utils.stripGoogleStyles(html).should.eql '<p><span><strong><em>B. 1981 in Madrid. Lives and works in Madrid.</em></strong></span></p>'

    it 'replaces styled spans that are nested in links', ->
      html = '<span style="font-size:11pt;color:#000000;background-color:transparent;font-weight:400;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">(via </span><a href="http://theartnewspaper.com/market/dealer-cuts-plea-bargain/" style="text-decoration:none;"><span style="font-size:11pt;color:#1155cc;background-color:transparent;font-weight:400;font-style:italic;font-variant:normal;text-decoration:underline;vertical-align:baseline;white-space:pre-wrap;">The Art Newspaper</span></a><span style="font-size:11pt;color:#000000;background-color:transparent;font-weight:400;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">)</span>'
      @utils.stripGoogleStyles(html).should.eql '<span><em>(via </em></span><a href="http://theartnewspaper.com/market/dealer-cuts-plea-bargain/" style="text-decoration:none;"><span><em>The Art Newspaper</em></span></a><span><em>)</em></span>'


  describe '#keyBindingFnFull', ->

    it 'returns the name of a recognized key binding', ->
      e = { keyCode: 50 }
      @utils.keyBindingFnFull(e).should.eql 'header-two'
      e = { keyCode: 51 }
      @utils.keyBindingFnFull(e).should.eql 'header-three'
      e = { keyCode: 191 }
      @utils.keyBindingFnFull(e).should.eql 'custom-clear'
      e = { keyCode: 55 }
      @utils.keyBindingFnFull(e).should.eql 'ordered-list-item'
      e = { keyCode: 56 }
      @utils.keyBindingFnFull(e).should.eql 'unordered-list-item'
      e = { keyCode: 75 }
      @utils.keyBindingFnFull(e).should.eql 'link-prompt'
      @getDefaultKeyBinding.callCount.should.eql 0

    it 'returns the default key binding if no command modifier', ->
      @KeyBindingUtil.hasCommandModifier = sinon.stub().returns(false)
      e = { keyCode: 75 }
      @utils.keyBindingFnFull(e)
      @getDefaultKeyBinding.callCount.should.eql 1

    it 'returns the default key binding if no custom setting specified', ->
      e = { keyCode: 45 }
      @utils.keyBindingFnFull(e)
      @getDefaultKeyBinding.callCount.should.eql 1
