benv = require 'benv'
{ resolve } = require 'path'
sinon = require 'sinon'
Backbone = require 'backbone'
fixtures = require '../../../../../../test/helpers/fixtures'

describe 'SectionText', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose
        $: benv.require 'jquery'
        React: require 'react'
        ReactDOM: require 'react-dom'
        ReactTestUtils: require 'react-addons-test-utils'
        Draft: require 'draft-js'
      window.jQuery = $
      window.getSelection = sinon.stub().returns(isCollapsed: false)
      @r =
        find: ReactTestUtils.findRenderedDOMComponentWithClass
        simulate: ReactTestUtils.Simulate
      @d =
        EditorState: Draft.EditorState
      global.HTMLElement = () => {}
      global.HTMLAnchorElement = () => {}
      @SectionText = benv.requireWithJadeify(
        resolve(__dirname, '../index'), ['icons']
      )
      InputUrl = benv.requireWithJadeify(
        resolve(__dirname, '../../../../../components/rich_text/components/input_url'), ['icons']
      )
      ButtonStyle = benv.requireWithJadeify(
        resolve(__dirname, '../../../../../components/rich_text/components/button_style'), ['icons']
      )
      @SectionText.__set__ 'InputUrl', React.createFactory InputUrl
      @SectionText.__set__ 'ButtonStyle', React.createFactory ButtonStyle
      @props = {
        editing: false
        section: new Backbone.Model {
          body: '<h2>01  <a name="here" class="is-jump-link">here is a toc.</a></h2><p class="stuff">In 2016, K mounted a <a href="https://www.artsy.net/artist/kow-hiwa-k-this-lemon-tastes-of-apple" class="is-follow-link" target="_blank">solo show</a><a class="entity-follow artist-follow"></a> at prescient Berlin gallery <a href="https://www.artsy.net/kow" target="_blank">KOW</a>, restaging his installation <i>It’s Spring and the Weather is Great so let’s close all object matters</i> (2012), for which he created seven step ladders with microphones and instruments attached for a performance initially meant to take place at Speakers’ Corner in London’s Hyde Park that was eventually mounted in 2010 at the <a href="https://www.artsy.net/serpentineuk" target="_blank">Serpentine Galleries</a>.</p><p><br></p><br>'
        }
      }
      @altProps = {
        editing: true
        section: new Backbone.Model {
          body: '<h2>A <em>short</em> piece of <b>text</b></h2>'
        }
      }
      @artistProps = {
        editing: true
        section: new Backbone.Model {
          body: '<h2><a href="https://www.artsy.net/artist/erin-shirreff" class="is-follow-link">Erin Shirreff</a></h2>'
        }
      }
      @component = ReactDOM.render React.createElement(@SectionText, @props), (@$el = $ "<div></div>")[0], => setTimeout =>
        @component.stickyControlsBox = sinon.stub().returns {top: 20, left: 40}

        # a second component for text selection
        @SectionText.__set__ 'sd',
          CURRENT_CHANNEL: fixtures().channels
        @shortComponent = ReactDOM.render React.createElement(@SectionText, @altProps), (@$el = $ "<div></div>")[0]
        @shortComponent.stickyControlsBox = sinon.stub().returns {top: 20, left: 40}
        @shortComponent.getSelectionLocation = sinon.stub().returns parent: {top: 20, left: 40}
        @shortComponent.state.editorState.getSelection().isCollapsed = sinon.stub().returns false
        shortSelection = @shortComponent.state.editorState.getSelection()
        newSelection = shortSelection.merge({
          anchorKey: @shortComponent.state.editorState.getCurrentContent().getFirstBlock().key
          anchorOffset: 0
          focusKey: @shortComponent.state.editorState.getCurrentContent().getFirstBlock().key
          focusOffset: @shortComponent.state.editorState.getCurrentContent().getFirstBlock().text.length
        })
        newEditorState = @d.EditorState.acceptSelection(@shortComponent.state.editorState, newSelection)
        @shortComponent.onChange newEditorState
        done()

  afterEach ->
    benv.teardown()


  describe 'Mount and Display', ->

    it 'Converts existing html to an editorState', ->
      @component.state.editorState.getCurrentContent().getFirstBlock().should.not.eql @component.state.editorState.getCurrentContent().getLastBlock()

    it 'Renders the existing body in the editor', ->
      editorText = $(ReactDOM.findDOMNode(@component)).find('.edit-section-text__input').text()
      editorText.should.containEql 'K mounted a solo show at prescient Berlin gallery KOW, restaging his installation It’s Spring and the Weather is Great'

    it 'Hides the menu when no text selection', ->
      @component.state.showMenu.should.eql false
      $(ReactDOM.findDOMNode(@component)).find('.edit-section-text__menu').length.should.eql 0

    it 'Shows the menu when text selection', ->
      @r.simulate.mouseUp @r.find @shortComponent, 'edit-section-text__input'
      @shortComponent.state.showMenu.should.eql true
      $(ReactDOM.findDOMNode(@shortComponent)).find('.edit-section-text__menu').length.should.eql 1

    it 'Converts html on change only plugin supported classes', ->
      @component.onChange(@component.state.editorState)
      @component.state.html.should.eql '<h2>01 &nbsp;<a name="here" class="is-jump-link">here is a toc.</a></h2><p>In 2016, K mounted a <a href="https://www.artsy.net/artist/kow-hiwa-k-this-lemon-tastes-of-apple" class="is-follow-link">solo show</a><a data-id="kow-hiwa-k-this-lemon-tastes-of-apple" class="entity-follow artist-follow"></a> at prescient Berlin gallery <a href="https://www.artsy.net/kow">KOW</a>, restaging his installation <em>It’s Spring and the Weather is Great so let’s close all object matters</em> (2012), for which he created seven step ladders with microphones and instruments attached for a performance initially meant to take place at Speakers’ Corner in London’s Hyde Park that was eventually mounted in 2010 at the <a href="https://www.artsy.net/serpentineuk">Serpentine Galleries</a>.</p><p><br></p><p><br></p>'


  describe 'Rich text menu events', ->

    it 'Opens a link input popup', ->
      @r.simulate.mouseUp @r.find @shortComponent, 'edit-section-text__input'
      @r.simulate.mouseDown @r.find @shortComponent, 'link'
      $(ReactDOM.findDOMNode(@shortComponent)).find('.rich-text--url-input').length.should.eql 1
      @shortComponent.state.showUrlInput.should.eql true

    it 'Can create italic entities', ->
      @r.simulate.mouseUp @r.find @shortComponent, 'edit-section-text__input'
      @shortComponent.setState = sinon.stub()
      @r.simulate.mouseDown @r.find @shortComponent, 'ITALIC'
      @shortComponent.setState.args[0][0].html.should.eql '<h2><em>A short piece of <strong>text</strong></em></h2>'

    it 'Can create bold entities', ->
      @r.simulate.mouseUp @r.find @shortComponent, 'edit-section-text__input'
      @shortComponent.setState = sinon.stub()
      @r.simulate.mouseDown @r.find @shortComponent, 'BOLD'
      @shortComponent.setState.args[0][0].html.should.eql '<h2><strong>A <em>short</em> piece of text</strong></h2>'

    it 'Can create strikethrough entities', ->
      @r.simulate.mouseUp @r.find @shortComponent, 'edit-section-text__input'
      @shortComponent.setState = sinon.stub()
      @r.simulate.mouseDown @r.find @shortComponent, 'STRIKETHROUGH'
      @shortComponent.setState.args[0][0].html.should.eql '<h2><span style="text-decoration:line-through;">A <em>short</em> piece of <strong>text</strong></span></h2>'

    it 'Can toggle h2 block changes', ->
      @r.simulate.mouseUp @r.find @shortComponent, 'edit-section-text__input'
      @shortComponent.setState = sinon.stub()
      @r.simulate.mouseDown @r.find @shortComponent, 'header-two'
      @shortComponent.setState.args[0][0].html.should.eql '<p>A <em>short</em> piece of <strong>text</strong></p>'

    it 'Can toggle h3 block changes and strips the styles', ->
      @r.simulate.mouseUp @r.find @shortComponent, 'edit-section-text__input'
      @shortComponent.setState = sinon.stub()
      @r.simulate.mouseDown @r.find @shortComponent, 'header-three'
      @shortComponent.setState.args[0][0].html.should.eql '<h3>A short piece of text</h3>'

    it 'Can toggle ul block changes', ->
      @r.simulate.mouseUp @r.find @shortComponent, 'edit-section-text__input'
      @shortComponent.setState = sinon.stub()
      @r.simulate.mouseDown @r.find @shortComponent, 'unordered-list-item'
      @shortComponent.setState.args[0][0].html.should.eql '<ul><li>A <em>short</em> piece of <strong>text</strong></li></ul>'

    it '#makePlainText Can strip styles', ->
      @r.simulate.mouseUp @r.find @shortComponent, 'edit-section-text__input'
      @shortComponent.makePlainText()
      @shortComponent.state.html.should.eql '<p>A short piece of text</p>'


  describe '#handleKeyCommand', ->

    it 'Can toggle bold entities', ->
      @shortComponent.setState = sinon.stub()
      @shortComponent.handleKeyCommand('bold')
      @shortComponent.setState.args[0][0].html.should.eql '<h2><strong>A <em>short</em> piece of text</strong></h2>'

    it 'Can toggle italic entities', ->
      @shortComponent.setState = sinon.stub()
      @shortComponent.handleKeyCommand('italic')
      @shortComponent.setState.args[0][0].html.should.eql '<h2><em>A short piece of <strong>text</strong></em></h2>'

    it 'Can toggle H2 entities', ->
      @shortComponent.setState = sinon.stub()
      @shortComponent.handleKeyCommand('header-two')
      @shortComponent.setState.args[0][0].html.should.eql '<p>A <em>short</em> piece of <strong>text</strong></p>'

    it 'Can toggle H3 entities', ->
      @shortComponent.setState = sinon.stub()
      @shortComponent.handleKeyCommand('header-three')
      @shortComponent.setState.args[0][0].html.should.eql '<h3>A short piece of text</h3>'

    it 'Can toggle UL entities', ->
      @shortComponent.setState = sinon.stub()
      @shortComponent.handleKeyCommand('unordered-list-item')
      @shortComponent.setState.args[0][0].html.should.eql '<ul><li>A <em>short</em> piece of <strong>text</strong></li></ul>'

    it 'Can toggle OL entities', ->
      @shortComponent.setState = sinon.stub()
      @shortComponent.handleKeyCommand('ordered-list-item')
      @shortComponent.setState.args[0][0].html.should.eql '<ol><li>A <em>short</em> piece of <strong>text</strong></li></ol>'

    it 'Can make plain text', ->
      @shortComponent.setState = sinon.stub()
      @shortComponent.handleKeyCommand('custom-clear')
      @shortComponent.setState.args[0][0].html.should.eql '<p>A short piece of text</p>'

    it 'Can open a link prompt', ->
      @shortComponent.setState = sinon.stub()
      @shortComponent.handleKeyCommand('link-prompt')
      @shortComponent.setState.args[0][0].showUrlInput.should.eql true


  describe 'Links', ->

    it 'Can confirm links without a class', ->
      @shortComponent.confirmLink 'link.com'
      @shortComponent.state.html.should.containEql '<a href="link.com">'

    it 'Can confirm links with a class', ->
      @shortComponent.confirmLink 'link.com', '', 'class'
      @shortComponent.state.html.should.containEql '<a href="link.com">'


  describe 'Plugins', ->

    it 'Only shows plugins when channel allows', ->
      @component.getPlugins().length.should.eql 0
      @SectionText.__set__ 'sd',
        CURRENT_CHANNEL: fixtures().channels
      component = ReactDOM.render React.createElement(@SectionText, @props), (@$el = $ "<div></div>")[0]
      component.getPlugins().length.should.eql 2

    it 'Can setup link prompt for artist blocks', ->
      @r.simulate.mouseUp @r.find @shortComponent, 'edit-section-text__input'
      @r.simulate.mouseDown @r.find @shortComponent, 'artist'
      @shortComponent.state.showUrlInput.should.eql true
      @shortComponent.state.pluginType.should.eql 'artist'

    it 'Can create toc blocks', ->
      @r.simulate.mouseUp @r.find @shortComponent, 'edit-section-text__input'
      @r.simulate.mouseDown @r.find @shortComponent, 'toc'
      @shortComponent.state.html.should.eql '<h2><a name="A" class="is-jump-link">A <em>short</em> piece of <strong>text</strong></a></h2>'

    it 'Adds data-id to artist links', ->
      component = ReactDOM.render React.createElement(@SectionText, @artistProps), (@$el = $ "<div></div>")[0]
      component.onChange(component.state.editorState)
      component.state.html.should.eql '<h2><a href="https://www.artsy.net/artist/erin-shirreff" class="is-follow-link">Erin Shirreff</a><a data-id="erin-shirreff" class="entity-follow artist-follow"></a></h2>'

    it 'Can toggle the artist plugin', ->
      @component.setState = sinon.stub()
      @component.setPluginType('artist')
      @component.setState.args[0][0].pluginType.should.eql 'artist'

    it 'Can toggle the toc plugin', ->
      @component.setState = sinon.stub()
      @component.setPluginType('toc')
      @component.setState.args[0][0].pluginType.should.eql 'toc'

    it 'Calls promt for link if artist', ->
      @component.promptForLink = sinon.stub()
      @component.setPluginType('artist')
      @component.promptForLink.called.should.eql true

    it 'Calls confirm link if new TOC', ->
      @component.confirmLink = sinon.stub()
      @component.getExistingLinkData = sinon.stub().returns { url: '', className: '' }
      @component.setPluginType('toc')
      @component.confirmLink.called.should.eql true

    it 'Removes a TOC if already exists', ->
      @component.removeLink = sinon.stub()
      @component.getExistingLinkData = sinon.stub().returns { url: '', className: 'is-jump-link' }
      @component.setPluginType('toc')
      @component.removeLink.called.should.eql true


  describe '#setPluginProps', ->

    it 'returns props for artist link', ->
      @component.getExistingLinkData = sinon.stub().returns {className: ''}
      artist = @component.setPluginProps('http://link.com', 'artist')
      artist.should.eql { url: 'http://link.com', className: 'is-follow-link', name: undefined }

    it 'can combine props for artist and toc links', ->
      @component.getExistingLinkData = sinon.stub().returns {className: 'is-jump-link'}
      artistToc = @component.setPluginProps('http://link.com', 'artist')
      artistToc.should.eql { url: 'http://link.com', className: 'is-follow-link is-jump-link', name: 'toc' }


  it '#onPaste strips or converts unsupported html and linebreaks', ->
    @component.onPaste('Here is a caption about an image yep.', '<meta><script>bad.stuff()</script><h1 class="stuff">Here is a</h1><ul><li><b>caption</b></li><li>about an <pre>image</pre></li></ul><p>yep.</p><br>')
    @component.state.html.should.startWith '<p>Here is a</p><ul><li><strong>caption</strong></li><li>about an image</li></ul>'


  describe '#stripGoogleStyles', ->

    it 'removes non-breaking spaces between paragraphs', ->
      html = '<p>hello</p><br><p>here again.</p><br class="Apple-interchange-newline">'
      @component.stripGoogleStyles(html).should.eql '<p>hello</p><p>here again.</p>'

    it 'removes dummy b tags google docs wraps document in', ->
      html = '<b style="font-weight:normal;" id="docs-internal-guid-ce2bb19a-cddb-9e53-cb18-18e71847df4e"><p><span style="font-size:11pt;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">Available at: Espacio Valverde • Galleries Sector, Booth 9F01</span></p>'
      @component.stripGoogleStyles(html).should.eql '<p><span style="font-size:11pt;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">Available at: Espacio Valverde • Galleries Sector, Booth 9F01</span></p>'

    it 'replaces bold spans with actual b tags', ->
      html = '<p><span style="font-size:11pt;color:#000000;background-color:transparent;font-weight:700;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">B. 1981 in Madrid. Lives and works in Madrid.</span></p>'
      @component.stripGoogleStyles(html).should.eql '<p><span><strong>B. 1981 in Madrid. Lives and works in Madrid.</strong></span></p>'

    it 'replaces italic spans with actual em tags', ->
      html = '<p><span style="font-size:11pt;color:#000000;background-color:transparent;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">B. 1981 in Madrid. Lives and works in Madrid.</span></p>'
      @component.stripGoogleStyles(html).should.eql '<p><span><em>B. 1981 in Madrid. Lives and works in Madrid.</em></span></p>'

    it 'replaces spans that are bold and italic', ->
      html = '<p><span style="font-size:11pt;color:#000000;background-color:transparent;font-weight:700;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">B. 1981 in Madrid. Lives and works in Madrid.</span></p>'
      @component.stripGoogleStyles(html).should.eql '<p><span><strong><em>B. 1981 in Madrid. Lives and works in Madrid.</em></strong></span></p>'

    it 'replaces styled spans that are nested in links', ->
      html = '<span style="font-size:11pt;color:#000000;background-color:transparent;font-weight:400;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">(via </span><a href="http://theartnewspaper.com/market/dealer-cuts-plea-bargain/" style="text-decoration:none;"><span style="font-size:11pt;color:#1155cc;background-color:transparent;font-weight:400;font-style:italic;font-variant:normal;text-decoration:underline;vertical-align:baseline;white-space:pre-wrap;">The Art Newspaper</span></a><span style="font-size:11pt;color:#000000;background-color:transparent;font-weight:400;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">)</span>'
      @component.stripGoogleStyles(html).should.eql '<span><em>(via </em></span><a href="http://theartnewspaper.com/market/dealer-cuts-plea-bargain/" style="text-decoration:none;"><span><em>The Art Newspaper</em></span></a><span><em>)</em></span>'

