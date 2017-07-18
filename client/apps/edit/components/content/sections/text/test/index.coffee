benv = require 'benv'
{ resolve } = require 'path'
sinon = require 'sinon'
Backbone = require 'backbone'
fixtures = require '../../../../../../../../test/helpers/fixtures'

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
      window.getSelection = sinon.stub().returns(
        isCollapsed: false
        getRangeAt: sinon.stub().returns(
          getClientRects: sinon.stub.returns([{
            bottom: 170
            height: 25
            left: 425
            right: 525
            top: 145
            width: 95
          }])
        )
      )
      global.Node = () => {}
      global.HTMLElement = () => {}
      global.HTMLAnchorElement = () => {}
      @r =
        find: ReactTestUtils.findRenderedDOMComponentWithClass
        simulate: ReactTestUtils.Simulate
      @d =
        EditorState: Draft.EditorState
      @SectionText = benv.require resolve(__dirname, '../index')
      InputUrl = benv.requireWithJadeify(
        resolve(__dirname, '../../../../../../../components/rich_text/components/input_url'), ['icons']
      )
      ButtonStyle = benv.requireWithJadeify(
        resolve(__dirname, '../../../../../../../components/rich_text/components/button_style'), ['icons']
      )
      @SectionText.__set__ 'InputUrl', React.createFactory InputUrl
      @SectionText.__set__ 'ButtonStyle', React.createFactory ButtonStyle
      @sections = new Backbone.Collection [
        {
          body: '<h2>01  <a name="here" class="is-jump-link">here is a toc.</a></h2><p class="stuff">In 2016, K mounted a <a href="https://www.artsy.net/artist/kow-hiwa-k-this-lemon-tastes-of-apple" class="is-follow-link" target="_blank">solo show</a><a class="entity-follow artist-follow"></a> at prescient Berlin gallery <a href="https://www.artsy.net/kow" target="_blank">KOW</a>, restaging his installation <i>It’s Spring and the Weather is Great so let’s close all object matters</i> (2012), for which he created seven step ladders with microphones and instruments attached for a performance initially meant to take place at Speakers’ Corner in London’s Hyde Park that was eventually mounted in 2010 at the <a href="https://www.artsy.net/serpentineuk" target="_blank">Serpentine Galleries</a>.</p><p><br></p><br>'
          type: 'text'
        },
        {
          body: '<h2>A <em>short</em> piece of <b>text</b></h2>'
          type: 'text'
        },
        {
          body: '<h2><a href="https://www.artsy.net/artist/erin-shirreff" class="is-follow-link">Erin Shirreff</a></h2>'
          type: 'text'
        }
      ]
      @props = {
        editing: false
        section: @sections.models[0]
        sections: @sections
        index: 1
        onSetEditing: sinon.stub()
      }
      @altProps = {
        editing: true
        section: @sections.models[1]
        sections: @sections
        index: 1
        onSetEditing: sinon.stub()
      }
      @artistProps = {
        editing: true
        section: @sections.models[2]
      }
      @component = ReactDOM.render React.createElement(@SectionText, @props), (@$el = $ "<div></div>")[0], => setTimeout =>
        @component.stickyControlsBox = sinon.stub().returns {top: 20, left: 40}
        # a second component for text selection
        @SectionText.__set__ 'sd',
          CURRENT_CHANNEL: fixtures().channels
        @shortComponent = ReactDOM.render React.createElement(@SectionText, @altProps), (@$el = $ "<div></div>")[0]
        @shortComponent.stickyControlsBox = sinon.stub().returns {top: 20, left: 40}
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

    it 'Converts html on change with only plugin supported classes', ->
      @component.onChange(@component.state.editorState)
      @component.state.html.should.eql '<h2>01 &nbsp;<a name="here" class="is-jump-link">here is a toc.</a></h2><p>In 2016, K mounted a <a href="https://www.artsy.net/artist/kow-hiwa-k-this-lemon-tastes-of-apple" class="is-follow-link">solo show</a><a data-id="kow-hiwa-k-this-lemon-tastes-of-apple" class="entity-follow artist-follow"></a> at prescient Berlin gallery <a href="https://www.artsy.net/kow">KOW</a>, restaging his installation <em>It’s Spring and the Weather is Great so let’s close all object matters</em> (2012), for which he created seven step ladders with microphones and instruments attached for a performance initially meant to take place at Speakers’ Corner in London’s Hyde Park that was eventually mounted in 2010 at the <a href="https://www.artsy.net/serpentineuk">Serpentine Galleries</a>.</p><p><br></p>'

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

    it 'Can toggle ol block changes', ->
      @r.simulate.mouseUp @r.find @shortComponent, 'edit-section-text__input'
      @shortComponent.setState = sinon.stub()
      @r.simulate.mouseDown @r.find @shortComponent, 'ordered-list-item'
      @shortComponent.setState.args[0][0].html.should.eql '<ol><li>A <em>short</em> piece of <strong>text</strong></li></ol>'

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

    it 'Can pass left arrow events to #handleChangeSection', ->
      @shortComponent.handleChangeSection = sinon.stub()
      @shortComponent.handleKeyCommand({key: 'ArrowLeft'})
      @shortComponent.handleChangeSection.called.should.eql true

    it 'Can pass right arrow events to #handleChangeSection', ->
      @shortComponent.handleChangeSection = sinon.stub()
      @shortComponent.handleKeyCommand({key: 'ArrowRight'})
      @shortComponent.handleChangeSection.called.should.eql true


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
      component.getPlugins().length.should.eql 1

    it 'Can setup link prompt for artist blocks', ->
      @r.simulate.mouseUp @r.find @shortComponent, 'edit-section-text__input'
      @r.simulate.mouseDown @r.find @shortComponent, 'artist'
      @shortComponent.state.showUrlInput.should.eql true
      @shortComponent.state.pluginType.should.eql 'artist'

    it 'Adds data-id to artist links', ->
      component = ReactDOM.render React.createElement(@SectionText, @artistProps), (@$el = $ "<div></div>")[0]
      component.onChange(component.state.editorState)
      component.state.html.should.eql '<h2><a href="https://www.artsy.net/artist/erin-shirreff" class="is-follow-link">Erin Shirreff</a><a data-id="erin-shirreff" class="entity-follow artist-follow"></a></h2>'

    it 'Can toggle the artist plugin', ->
      @component.setState = sinon.stub()
      @component.setPluginType('artist')
      @component.setState.args[0][0].pluginType.should.eql 'artist'

    it 'Calls promt for link if artist', ->
      @component.promptForLink = sinon.stub()
      @component.setPluginType('artist')
      @component.promptForLink.called.should.eql true

  describe '#setPluginProps', ->

    it 'returns props for artist link', ->
      @component.getExistingLinkData = sinon.stub().returns {className: ''}
      artist = @component.setPluginProps('http://link.com', 'artist')
      artist.should.eql { url: 'http://link.com', className: 'is-follow-link' }

  describe '#handleChangeSection', ->

    it 'R-> Moves the cursor over one if not at end of block', ->
      @shortComponent.onChange = sinon.stub()
      @shortComponent.handleKeyCommand({key: 'ArrowRight'})
      prevSelection = @shortComponent.state.editorState.getSelection()
      newSelection = @shortComponent.onChange.args[0][0].getSelection()
      newSelection.anchorOffset.should.eql 1
      newSelection.anchorOffset.should.not.eql prevSelection.achorOffset

    it 'R-> Moves the cursor to next block if at end of block', ->
      setSelection = @component.state.editorState.getSelection().merge({
        anchorKey: @component.state.editorState.getCurrentContent().getFirstBlock().key
        anchorOffset: @component.state.editorState.getCurrentContent().getFirstBlock().getLength()
        focusKey: @component.state.editorState.getCurrentContent().getFirstBlock().key
        focusOffset: @component.state.editorState.getCurrentContent().getFirstBlock().getLength()
      })
      newEditorState = @d.EditorState.acceptSelection(@component.state.editorState, setSelection)
      @component.onChange newEditorState
      @component.onChange = sinon.stub()
      @component.handleKeyCommand({key: 'ArrowRight'})
      prevSelection = @component.state.editorState.getSelection()
      newSelection = @component.onChange.args[0][0].getSelection()
      newSelection.anchorOffset.should.eql 0
      newSelection.anchorOffset.should.not.eql prevSelection.achorOffset
      newSelection.anchorKey.should.not.eql prevSelection.anchorKey

    it 'L-> Moves the cursor over one if not at start of block', ->
      setSelection = @component.state.editorState.getSelection().merge({
        anchorKey: @component.state.editorState.getCurrentContent().getFirstBlock().key
        anchorOffset: @component.state.editorState.getCurrentContent().getFirstBlock().getLength()
        focusKey: @component.state.editorState.getCurrentContent().getFirstBlock().key
        focusOffset: @component.state.editorState.getCurrentContent().getFirstBlock().getLength()
      })
      newEditorState = @d.EditorState.acceptSelection(@component.state.editorState, setSelection)
      @component.onChange newEditorState
      @component.onChange = sinon.stub()
      @component.handleKeyCommand({key: 'ArrowLeft'})
      prevSelection = @component.state.editorState.getSelection()
      newSelection = @component.onChange.args[0][0].getSelection()
      newSelection.anchorOffset.should.eql 17
      newSelection.anchorOffset.should.not.eql prevSelection.achorOffset

    it 'L-> Moves the cursor to previous block if at start of block', ->
      firstBlock = @component.state.editorState.getCurrentContent().getFirstBlock().key
      setSelection = @component.state.editorState.getSelection().merge({
        anchorKey: @component.state.editorState.getCurrentContent().getBlockAfter(firstBlock).key
        anchorOffset: 0
        focusKey: @component.state.editorState.getCurrentContent().getBlockAfter(firstBlock).key
        focusOffset: 0
      })
      newEditorState = @d.EditorState.acceptSelection(@component.state.editorState, setSelection)
      @component.onChange newEditorState
      @component.onChange = sinon.stub()
      @component.handleKeyCommand({key: 'ArrowLeft'})
      prevSelection = @component.state.editorState.getSelection()
      newSelection = @component.onChange.args[0][0].getSelection()
      newSelection.anchorOffset.should.eql 18
      newSelection.anchorOffset.should.not.eql prevSelection.achorOffset
      newSelection.anchorKey.should.not.eql prevSelection.anchorKey

    it 'R-> Moves the cursor to the next section if at end of block', ->
      setSelection = @component.state.editorState.getSelection().merge({
        anchorKey: @component.state.editorState.getCurrentContent().getLastBlock().key
        anchorOffset: @component.state.editorState.getCurrentContent().getLastBlock().getLength()
        focusKey: @component.state.editorState.getCurrentContent().getLastBlock().key
        focusOffset: @component.state.editorState.getCurrentContent().getLastBlock().getLength()
      })
      newEditorState = @d.EditorState.acceptSelection(@component.state.editorState, setSelection)
      @component.onChange newEditorState
      @component.handleKeyCommand({key: 'ArrowRight'})
      @component.props.onSetEditing.args[0][0].should.eql 2

    it 'L-> Moves the cursor to the previous section if at start of block', ->
      setSelection = @component.state.editorState.getSelection().merge({
        anchorKey: @component.state.editorState.getCurrentContent().getFirstBlock().key
        anchorOffset: 0
        focusKey: @component.state.editorState.getCurrentContent().getFirstBlock().key
        focusOffset: 0
      })
      newEditorState = @d.EditorState.acceptSelection(@component.state.editorState, setSelection)
      @component.onChange newEditorState
      @component.handleKeyCommand({key: 'ArrowLeft'})
      @component.props.onSetEditing.args[0][0].should.eql 0


  describe '#handleTab', ->

    it 'jumps to the next section', ->
      @component.handleTab {key: 'tab', preventDefault: sinon.stub()}
      @component.props.onSetEditing.args[0][0].should.eql 2

    it 'if shift key, jumps to the previous section', ->
      @component.handleTab {key: 'tab', shiftKey: true, preventDefault: sinon.stub()}
      @component.props.onSetEditing.args[0][0].should.eql 0


  describe '#handleReturn', ->

    it 'returns default behaviour if in first block', ->
      @component.splitSection = sinon.stub()
      setSelection = @component.state.editorState.getSelection().merge({
        anchorKey: @component.state.editorState.getCurrentContent().getFirstBlock().key
        anchorOffset: 0
        focusKey: @component.state.editorState.getCurrentContent().getFirstBlock().key
        focusOffset: 0
      })
      newEditorState = @d.EditorState.acceptSelection(@component.state.editorState, setSelection)
      @component.onChange newEditorState
      @component.handleReturn({key: 'enter'})
      @component.splitSection.notCalled.should.eql true

    it 'returns default behaviour if in block with content', ->
      @component.splitSection = sinon.stub()
      setSelection = @component.state.editorState.getSelection().merge({
        anchorKey: @component.state.editorState.getCurrentContent().getFirstBlock().key
        anchorOffset: 1
        focusKey: @component.state.editorState.getCurrentContent().getFirstBlock().key
        focusOffset: 1
      })
      newEditorState = @d.EditorState.acceptSelection(@component.state.editorState, setSelection)
      @component.onChange newEditorState
      @component.handleReturn({key: 'enter'})
      @component.splitSection.notCalled.should.eql true

    it 'calls splitSection if in empty block', ->
      @component.splitSection = sinon.stub()
      setSelection = @component.state.editorState.getSelection().merge({
        anchorKey: @component.state.editorState.getCurrentContent().getLastBlock().key
        anchorOffset: 0
        focusKey: @component.state.editorState.getCurrentContent().getLastBlock().key
        focusOffset: 0
      })
      newEditorState = @d.EditorState.acceptSelection(@component.state.editorState, setSelection)
      @component.onChange newEditorState
      @component.handleReturn({key: 'enter', preventDefault: sinon.stub()})
      @component.splitSection.called.should.eql true

  describe '#handleBackspace', ->

    it 'merges section with previous section if at start of block', ->
      setSelection = @shortComponent.state.editorState.getSelection().merge({
        anchorKey: @shortComponent.state.editorState.getCurrentContent().getFirstBlock().key
        anchorOffset: 0
        focusKey: @shortComponent.state.editorState.getCurrentContent().getFirstBlock().key
        focusOffset: 0
      })
      newEditorState = @d.EditorState.acceptSelection(@shortComponent.state.editorState, setSelection)
      @shortComponent.onChange newEditorState
      @shortComponent.handleBackspace {key: 'backspace'}
      @shortComponent.props.onSetEditing.args[0][0].should.eql 0
      @shortComponent.state.html.should.containEql '<h2>A <em>short</em> piece of <strong>text</strong></h2>'
      @shortComponent.state.html.should.containEql '<p>In 2016, K mounted a'

  describe '#splitSection', ->

    it 'splits a section into two', ->
      firstBlock = @component.state.editorState.getCurrentContent().getFirstBlock().key
      setSelection = @component.state.editorState.getSelection().merge({
        anchorKey: @component.state.editorState.getCurrentContent().getKeyAfter(firstBlock)
        anchorOffset: 0
        focusKey: @component.state.editorState.getCurrentContent().getKeyAfter(firstBlock)
        focusOffset: 0
      })
      newEditorState = @d.EditorState.acceptSelection(@component.state.editorState, setSelection)
      @component.onChange newEditorState
      @component.handleReturn({key: 'enter', preventDefault: sinon.stub()})
      @component.handleReturn({key: 'enter', preventDefault: sinon.stub()})
      @component.props.sections.length.should.eql 4
      @component.state.html.should.not.containEql '<p>In 2016, K mounted a'
      @component.props.sections.models[@component.props.index + 1].get('body').should.containEql '<p>In 2016, K mounted a'


  describe '#onPaste', ->

    it 'strips or converts unsupported html and linebreaks', ->
      @component.onPaste('Here is a caption about an image yep.', '<meta><script>bad.stuff()</script><h1 class="stuff">Here is a</h1><ul><li><b>caption</b></li><li>about an <pre>image</pre></li></ul><p>yep.</p><br>')
      @component.state.html.should.startWith '<p>Here is a</p><ul><li><strong>caption</strong></li><li>about an image</li></ul>'
