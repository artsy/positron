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
      global.HTMLElement = () => {}
      global.HTMLAnchorElement = () => {}
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

  describe 'Keybindings', ->
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
        e = { keyCode: 49 }
        @utils.keyBindingFnFull(e).should.eql 'header-one'
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
        e = { keyCode: 219 }
        @utils.keyBindingFnFull(e).should.eql 'blockquote'
        e = { keyCode: 88 , shiftKey: true}
        @utils.keyBindingFnFull(e).should.eql 'strikethrough'
        @getDefaultKeyBinding.callCount.should.eql 0

      it 'returns the keyboard event of left or right arrow keys', ->
        e = { keyCode: 37 }
        @utils.keyBindingFnFull(e).should.eql { keyCode: 37 }
        e = { keyCode: 39 }
        @utils.keyBindingFnFull(e).should.eql { keyCode: 39 }
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

    describe '#keyBindingFnCaption', ->

      it 'returns the name of a recognized key binding', ->
        e = { keyCode: 75 }
        @utils.keyBindingFnCaption(e).should.eql 'link-prompt'
        @getDefaultKeyBinding.callCount.should.eql 0

      it 'returns the default key binding if no command modifier', ->
        @KeyBindingUtil.hasCommandModifier = sinon.stub().returns(false)
        e = { keyCode: 75 }
        @utils.keyBindingFnCaption(e)
        @getDefaultKeyBinding.callCount.should.eql 1

      it 'returns the default key binding if no custom setting specified', ->
        e = { keyCode: 45 }
        @utils.keyBindingFnCaption(e)
        @getDefaultKeyBinding.callCount.should.eql 1


  describe 'Selection State', ->

    describe '#getSelectionDetails', ->

      it 'Knows if selection focus is in first block', ->
        selection = @utils.getSelectionDetails(@editorState)
        selection.isFirstBlock.should.eql true
        selection.isLastBlock.should.eql false
        (typeof selection.beforeKey).should.be.undefined

      it 'Knows if selection focus is in first character of block', ->
        selection = @utils.getSelectionDetails(@editorState)
        selection.isFirstCharacter.should.eql true
        selection.isLastCharacter.should.eql false
        selection.anchorOffset.should.eql 0

      it 'Knows if selection focus is in last block', ->
        setSelection = @editorState.getSelection().merge({
          anchorKey: @editorState.getCurrentContent().getLastBlock().key
          anchorOffset: @editorState.getCurrentContent().getLastBlock().getLength()
          focusKey: @editorState.getCurrentContent().getLastBlock().key
          focusOffset: @editorState.getCurrentContent().getLastBlock().getLength()
        })
        editorState = @d.EditorState.acceptSelection(@editorState, setSelection)
        selection = @utils.getSelectionDetails(editorState)
        selection.isLastBlock.should.eql true
        selection.isFirstBlock.should.eql false
        (typeof selection.afterKey).should.be.undefined

      it 'Knows if selection focus is in last character of block', ->
        setSelection = @editorState.getSelection().merge({
          anchorKey: @editorState.getCurrentContent().getFirstBlock().key
          anchorOffset: @editorState.getCurrentContent().getFirstBlock().getLength()
          focusKey: @editorState.getCurrentContent().getFirstBlock().key
          focusOffset: @editorState.getCurrentContent().getFirstBlock().getLength()
        })
        editorState = @d.EditorState.acceptSelection(@editorState, setSelection)
        selection = @utils.getSelectionDetails(editorState)
        selection.isLastCharacter.should.eql true
        selection.isLastBlock.should.eql false
        selection.isFirstCharacter.should.eql false
        selection.anchorOffset.should.eql 116

    describe '#moveSelection', ->

      it 'Can move the selection one step ahead', ->
        newState = @utils.moveSelection @editorState, @editorState.getSelection(), 1
        newState.getSelection().anchorOffset.should.eql 1

      it 'Can move the selection one step back', ->
        setSelection = @editorState.getSelection().merge({
          anchorKey: @editorState.getCurrentContent().getFirstBlock().key
          anchorOffset: @editorState.getCurrentContent().getFirstBlock().getLength()
          focusKey: @editorState.getCurrentContent().getFirstBlock().key
          focusOffset: @editorState.getCurrentContent().getFirstBlock().getLength()
        })
        editorState = @d.EditorState.acceptSelection(@editorState, setSelection)
        editorState.getSelection().anchorOffset.should.eql 116
        newState = @utils.moveSelection editorState, editorState.getSelection(), -1
        newState.getSelection().anchorOffset.should.eql 115

      it 'Can jump to the start of the next block', ->
        setSelection = @editorState.getSelection().merge({
          anchorKey: @editorState.getCurrentContent().getFirstBlock().key
          anchorOffset: @editorState.getCurrentContent().getFirstBlock().getLength()
          focusKey: @editorState.getCurrentContent().getFirstBlock().key
          focusOffset: @editorState.getCurrentContent().getFirstBlock().getLength()
        })
        editorState = @d.EditorState.acceptSelection(@editorState, setSelection)
        editorState.getSelection().anchorOffset.should.eql 116
        newState = @utils.moveSelection editorState, @utils.getSelectionDetails(editorState), 1
        newState.getSelection().anchorOffset.should.eql 0
        newState.getSelection().anchorKey.should.not.eql editorState.getSelection().anchorKey

      it 'Can jump to the end of a previous block', ->
        setSelection = @editorState.getSelection().merge({
          anchorKey: @editorState.getCurrentContent().getLastBlock().key
          anchorOffset: 0
          focusKey: @editorState.getCurrentContent().getLastBlock().key
          focusOffset: 0
        })
        editorState = @d.EditorState.acceptSelection(@editorState, setSelection)
        newState = @utils.moveSelection editorState, @utils.getSelectionDetails(editorState), -1
        newState.getSelection().anchorOffset.should.eql 116
        newState.getSelection().anchorKey.should.not.eql editorState.getSelection().anchorKey


    describe 'Sticky controls', ->

      it '#getSelectionLocation returns coordinates of the selection and its parent', ->
        location = @utils.getSelectionLocation({top: 520, left: 50})
        location.target.should.eql = [{
          bottom: 170
          height: 25
          left: 425
          right: 525
          top: 145
          width: 95
        }]
        location.parent.should.eql { top: 20, left: 50 }

    it '#stickyControlsBox returns coordinates of the sticky item', ->
      controls = @utils.stickyControlsBox @utils.getSelectionLocation({top: 520, left: 50}), 50, 100
      controls.should.eql { top: 175, left: 322.5 }


  describe '#standardizeSpacing', ->
    it 'removes freestanding linebreaks', ->
      html = @utils.standardizeSpacing '<br><p><br></p><p></p><br>'
      html.should.eql '<p><br></p>'

    it 'replaces consecutive empty paragraphs with one', ->
      html = @utils.standardizeSpacing '<p></p><p></p>'
      html.should.eql '<p><br></p>'

    it 'replaces empty headers with empty paragraphs', ->
      h2 = @utils.standardizeSpacing '<h2></h2>'
      h3 = @utils.standardizeSpacing '<h3></h3>'
      html = @utils.standardizeSpacing '<h2></h2><h3></h3>'
      h2.should.eql '<p><br></p>'
      h3.should.eql '<p><br></p>'
      html.should.eql '<p><br></p>'

    it 'converts consecutive spaces into nbsp', ->
      html = @utils.standardizeSpacing '<p>   </p>'
      html.should.eql '<p> &nbsp; </p>'

  describe '#stripH3Tags', ->

    it 'removes nested html inside h3 blocks', ->
      html = @utils.stripH3Tags '<h3>A <em>short</em> piece of <strong>text</strong></h3>'
      html.should.eql '<h3>A short piece of text</h3>'
