import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import {
  applySelectionToEditorState,
  htmlWithDisallowedStyles,
  htmlWithRichBlocks,
} from "client/components/draft/shared/test_helpers"
import { convertFromHTML } from "draft-convert"
import Draft, { EditorState } from "draft-js"
import { mount } from "enzyme"
import React from "react"
import { RichText } from "../rich_text"

jest.mock("lodash/debounce", () => jest.fn(e => e))

Draft.getVisibleSelectionRect = jest.fn().mockReturnValue({
  bottom: 170,
  height: 25,
  left: 425,
  right: 525,
  top: 145,
  width: 95,
})

const Selection = require("../../shared/selection")
jest.mock("../../shared/selection", () => ({
  getSelectionDetails: jest.fn().mockReturnValue({
    anchorOffset: 0,
    isFirstBlock: true,
  }),
}))

window.scrollTo = jest.fn()

describe("RichText", () => {
  let props
  const html = StandardArticle.sections && StandardArticle.sections[0].body

  const getWrapper = (passedProps = props) => {
    return mount(<RichText {...passedProps} />)
  }

  beforeEach(() => {
    props = {
      allowedBlocks: ["h1", "h2", "h3", "ul", "ol", "blockquote", "p"],
      html,
      hasLinks: true,
      onChange: jest.fn(),
      onHandleBackspace: jest.fn(),
      onHandleBlockQuote: jest.fn(),
      onHandleReturn: jest.fn(),
      onHandleTab: jest.fn(),
      placeholder: "Start typing...",
    }
    delete props.allowedStyles
  })

  const getClientRects = jest.fn().mockReturnValue([
    {
      bottom: 170,
      height: 25,
      left: 425,
      right: 525,
      top: 145,
      width: 95,
    },
  ])
  const getRangeAt = jest.fn().mockReturnValue({ getClientRects })

  describe("#setEditorState", () => {
    describe("Create from empty", () => {
      it("Can initialize an empty state", () => {
        props.html = null
        const component = getWrapper()

        expect(component.text()).toBe("Start typing...")
      })
    })

    describe("Create with content", () => {
      it("Can initialize with existing content", () => {
        const component = getWrapper()
        expect(component.text()).toMatch(
          "What would Antoine Court’s de Gébelin think of the Happy Squirrel?"
        )
      })

      it("Can initialize existing content with decorators", () => {
        const component = getWrapper()
        expect(component.html()).toMatch("<a href=")
      })
    })
  })

  describe("#editorStateToHtml", () => {
    it("Removes disallowed blocks from existing content", () => {
      const disallowedBlocks = convertFromHTML({})(htmlWithRichBlocks)
      const editorState = EditorState.createWithContent(disallowedBlocks)
      const component = getWrapper().instance() as RichText
      const stateAsHtml = component.editorStateToHTML(editorState)

      expect(stateAsHtml).toBe(
        "<p>a link</p><p></p><h1>an h1</h1><h2>an h2</h2><h3>an h3</h3><p>an h4</p><p>an h5</p><p>an h6</p><ul><li>unordered list</li><li>second list item</li></ul><ol><li>ordered list</li></ol><blockquote>a blockquote</blockquote>"
      )
    })

    it("Removes disallowed styles from existing content", () => {
      const disallowedStyles = convertFromHTML({})(htmlWithDisallowedStyles)
      const editorState = EditorState.createWithContent(disallowedStyles)
      const component = getWrapper().instance() as RichText
      const stateAsHtml = component.editorStateToHTML(editorState)

      expect(stateAsHtml).toBe(
        "<p><s>Strikethrough text</s> Code text Underline text <i>Italic text</i> <i>Italic text</i> <b>Bold text</b> <b>Bold text</b></p>"
      )
    })
  })

  describe("#editorStateFromHTML", () => {
    it("Removes disallowed blocks", () => {
      props.html = htmlWithRichBlocks
      props.hasLinks = true
      const component = getWrapper()
      const instance = component.instance() as RichText
      const editorState = instance.editorStateFromHTML(component.props().html)
      instance.onChange(editorState)

      expect(instance.state.html).toBe(
        '<p><a href="https://artsy.net/">a link</a></p><h1>an h1</h1><h2>an h2</h2><h3>an h3</h3><p>an h4</p><p>an h5</p><p>an h6</p><ul><li>unordered list</li><li>second list item</li></ul><ol><li>ordered list</li></ol><blockquote>a blockquote</blockquote>'
      )
    })

    it("Removes links if props.hasLinks is false", () => {
      props.html = htmlWithRichBlocks
      props.hasLinks = false
      const component = getWrapper()
      const instance = component.instance() as RichText
      const editorState = instance.editorStateFromHTML(component.props().html)
      instance.onChange(editorState)

      expect(instance.state.html).toBe(
        "<p>a link</p><h1>an h1</h1><h2>an h2</h2><h3>an h3</h3><p>an h4</p><p>an h5</p><p>an h6</p><ul><li>unordered list</li><li>second list item</li></ul><ol><li>ordered list</li></ol><blockquote>a blockquote</blockquote>"
      )
    })

    it("Removes empty blocks unless h1", () => {
      props.html = "<p>A paragraph</p><p></p><h1></h1><h2></h2>"
      const component = getWrapper()
      const instance = component.instance() as RichText
      const editorState = instance.editorStateFromHTML(component.props().html)
      instance.onChange(editorState)

      expect(instance.state.html).toBe("<p>A paragraph</p><h1></h1>")
    })

    it("Removes disallowed styles", () => {
      props.html = htmlWithDisallowedStyles
      const component = getWrapper()
      const instance = component.instance() as RichText
      const editorState = instance.editorStateFromHTML(component.props().html)
      instance.onChange(editorState)

      expect(instance.state.html).toBe(
        "<p><s>Strikethrough text</s> Code text Underline text <i>Italic text</i> <i>Italic text</i> <b>Bold text</b> <b>Bold text</b></p>"
      )
    })

    it("Calls #stripGoogleStyles", () => {
      props.html =
        '<b style="font-weight:normal;" id="docs-internal-guid-ce2bb19a-cddb-9e53-cb18-18e71847df4e"><p><span style="font-size:11pt;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">Available at: <em>Espacio Valverde</em> • Galleries Sector, Booth 9F01</span></p>'
      const component = getWrapper(props)
      const instance = component.instance() as RichText
      const editorState = instance.editorStateFromHTML(component.props().html)
      instance.onChange(editorState)

      expect(instance.state.html).toBe(
        "<p>Available at: <i>Espacio Valverde</i> • Galleries Sector, Booth 9F01</p>"
      )
    })
  })

  describe("#onChange", () => {
    it("Sets state with new editorState and html", () => {
      const editorContent = convertFromHTML({})("<p>A new piece of text.</p>")
      const editorState = EditorState.createWithContent(editorContent)
      const component = getWrapper(props)
      const instance = component.instance() as RichText
      const originalState = instance.state.editorState
      instance.onChange(editorState)

      expect(instance.state.html).toBe("<p>A new piece of text.</p>")
      expect(instance.state.editorState).not.toBe(originalState)
    })

    it("Calls props.onChange if html is changed", () => {
      const editorContent = convertFromHTML({})("<p>A new piece of text.</p>")
      const editorState = EditorState.createWithContent(editorContent)
      const component = getWrapper()
      const instance = component.instance() as RichText
      instance.onChange(editorState)

      expect(instance.state.html).toBe("<p>A new piece of text.</p>")
      expect(instance.props.onChange).toHaveBeenCalled()
    })

    it("Does not call props.onChange if html is unchanged", () => {
      props.html = "<p>A new piece of text.</p>"
      const editorContent = convertFromHTML({})(props.html)
      const editorState = EditorState.createWithContent(editorContent)
      const component = getWrapper()
      const instance = component.instance() as RichText
      instance.setState = jest.fn()
      component.update()
      instance.onChange(editorState)

      expect(instance.setState).toBeCalled()
      expect(instance.props.onChange).not.toHaveBeenCalled()
    })
  })

  describe("#focus", () => {
    beforeEach(() => {
      window.getSelection = jest.fn().mockReturnValue({
        isCollapsed: false,
        getRangeAt,
      })
    })

    it("Calls focus on the editor", () => {
      const component = getWrapper()
      const instance = component.instance() as RichText
      instance.focus()
      // TODO: update to work with new enzyme types
      // @ts-ignore
      const { hasFocus } = instance.state.editorState.getSelection()

      expect(hasFocus).toBeTruthy()
    })

    it("Calls #checkSelection", () => {
      const component = getWrapper()
      const instance = component.instance() as RichText
      instance.checkSelection = jest.fn()
      component.update()
      instance.focus()

      expect(instance.checkSelection).toBeCalled()
    })
  })

  it("#blur removes focus from the editor", () => {
    const component = getWrapper()
    const instance = component.instance() as RichText
    const selectedState = applySelectionToEditorState(
      instance.state.editorState
    )
    instance.onChange(selectedState)
    instance.blur()
    // TODO: update to work with new enzyme types
    // @ts-ignore
    const { hasFocus } = instance.state.editorState.getSelection()

    expect(hasFocus).toBeFalsy()
  })

  describe("#resetEditorState", () => {
    it("Resets the editorState with current props.html", done => {
      const component = getWrapper()
      const instance = component.instance() as RichText
      props.html = "<p>A piece of text</p>"
      component.setProps(props)
      instance.resetEditorState()

      setTimeout(() => {
        expect(instance.state.html).toBe("<p>A piece of text</p>")
        done()
      }, 10)
    })
  })

  xdescribe("#componentWillReceiveProps", () => {
    xit("does a thing", () => {
      expect(true).toBeTruthy()
    })
  })

  describe("#handleBackspace", () => {
    it("Returns not handled if cursor is inside block", () => {
      window.getSelection = jest.fn().mockReturnValue({
        isCollapsed: false,
        getRangeAt,
      })
      const component = getWrapper()
      const instance = component.instance() as RichText
      instance.blur = jest.fn()
      component.update()
      const selectedState = applySelectionToEditorState(
        instance.state.editorState,
        20
      )
      instance.onChange(selectedState)
      const handler = instance.handleBackspace()

      expect(handler).toBe("not-handled")
      expect(props.onHandleBackspace).not.toBeCalled()
      expect(instance.blur).not.toBeCalled()
    })

    it("Returns not handled if text is selected", () => {
      window.getSelection = jest.fn().mockReturnValue({
        isCollapsed: true,
        getRangeAt,
      })
      const component = getWrapper()
      const instance = component.instance() as RichText
      instance.blur = jest.fn()
      component.update()
      const selectedState = applySelectionToEditorState(
        instance.state.editorState,
        20
      )
      instance.onChange(selectedState)
      const handler = instance.handleBackspace()

      expect(handler).toBe("not-handled")
      expect(props.onHandleBackspace).not.toBeCalled()
      expect(instance.blur).not.toBeCalled()
    })

    it("Returns not handled if props.onHandleBackspace is not provided", () => {
      delete props.onHandleBackspace
      window.getSelection = jest.fn().mockReturnValue({
        isCollapsed: false,
        getRangeAt,
      })
      const component = getWrapper()
      const instance = component.instance() as RichText
      instance.blur = jest.fn()
      component.update()
      instance.focus()
      const handler = instance.handleBackspace()

      expect(handler).toBe("not-handled")
      expect(instance.blur).not.toBeCalled()
    })

    it("If blocks should merge, returns handled", () => {
      window.getSelection = jest.fn().mockReturnValue({
        isCollapsed: false,
        getRangeAt,
      })
      const component = getWrapper()
      const instance = component.instance() as RichText
      instance.blur = jest.fn()
      component.update()
      instance.focus()
      const handler = instance.handleBackspace()

      expect(handler).toBe("handled")
      expect(props.onHandleBackspace).toBeCalled()
      expect(instance.blur).toBeCalled()
    })
  })

  describe("#handleReturn", () => {
    it("Calls props.onHandleReturn provided and result is handled", () => {
      Selection.getSelectionDetails.mockReturnValueOnce({
        isFirstBlock: false,
      })

      const preventDefault = jest.fn()
      const component = getWrapper(props).instance() as RichText
      component.focus()
      const handleReturn = component.handleReturn({ preventDefault })

      expect(preventDefault).toBeCalled()
      expect(props.onHandleReturn).toBeCalled()
      expect(handleReturn).toBe("handled")
    })

    it("Does not call props.onHandleReturn provided and result is not-handled", () => {
      const component = getWrapper(props).instance() as RichText
      const handleReturn = component.handleReturn({})

      expect(handleReturn).toBe("not-handled")
      expect(props.onHandleReturn).not.toBeCalled()
    })

    it("Returns not-handled by default", () => {
      const component = getWrapper(props).instance() as RichText
      const handleReturn = component.handleReturn({})

      expect(handleReturn).toBe("not-handled")
      expect(props.onHandleReturn).not.toBeCalled()
    })
  })

  describe("#handleKeyCommand", () => {
    it("Calls #handleBackspace if backspace", () => {
      const component = getWrapper()
      const instance = component.instance() as RichText
      instance.handleBackspace = jest.fn()
      component.update()
      instance.handleKeyCommand("backspace")

      expect(instance.handleBackspace).toBeCalled()
    })

    it("Calls #makePlainText if plain-text", () => {
      const component = getWrapper()
      const instance = component.instance() as RichText
      instance.makePlainText = jest.fn()
      component.update()
      instance.handleKeyCommand("plain-text")

      expect(instance.makePlainText).toBeCalled()
    })

    describe("links", () => {
      it("Calls #promptForLink if link-prompt and props.hasLinks", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        instance.promptForLink = jest.fn()
        component.update()
        instance.handleKeyCommand("link-prompt")

        expect(instance.promptForLink).toBeCalled()
      })

      it("Returns not-handled if link-prompt and props.hasLinks is false", () => {
        props.hasLinks = false
        const component = getWrapper()
        const instance = component.instance() as RichText
        instance.promptForLink = jest.fn()
        component.update()
        const handleKeyCommand = instance.handleKeyCommand("link-prompt")

        expect(instance.promptForLink).not.toBeCalled()
        expect(handleKeyCommand).toBe("not-handled")
      })
    })

    describe("blocks", () => {
      it("Calls #keyCommandBlockType if blockquote", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        instance.keyCommandBlockType = jest.fn()
        component.update()
        instance.handleKeyCommand("blockquote")

        expect(instance.keyCommandBlockType).toBeCalledWith("blockquote")
      })

      it("Calls #keyCommandBlockType if header-one", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        instance.keyCommandBlockType = jest.fn()
        component.update()
        instance.handleKeyCommand("header-one")

        expect(instance.keyCommandBlockType).toBeCalledWith("header-one")
      })

      it("Calls #keyCommandBlockType if header-two", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        instance.keyCommandBlockType = jest.fn()
        component.update()
        instance.handleKeyCommand("header-two")

        expect(instance.keyCommandBlockType).toBeCalledWith("header-two")
      })

      it("Calls #keyCommandBlockType if header-three", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        instance.keyCommandBlockType = jest.fn()
        component.update()
        instance.handleKeyCommand("header-three")

        expect(instance.keyCommandBlockType).toBeCalledWith("header-three")
      })

      it("Returns not-handled for disallowed blocks", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        instance.keyCommandBlockType = jest.fn()
        component.update()
        instance.handleKeyCommand("header-four")

        expect(instance.keyCommandBlockType).not.toBeCalled()
      })
    })

    describe("styles", () => {
      it("Calls #keyCommandInlineStyle if bold", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        instance.keyCommandInlineStyle = jest.fn()
        component.update()
        instance.handleKeyCommand("bold")

        expect(instance.keyCommandInlineStyle).toBeCalledWith("bold")
      })

      it("Calls #keyCommandInlineStyle if italic", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        instance.keyCommandInlineStyle = jest.fn()
        component.update()
        instance.handleKeyCommand("italic")

        expect(instance.keyCommandInlineStyle).toBeCalledWith("italic")
      })

      it("Calls #keyCommandInlineStyle if underline", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        instance.keyCommandInlineStyle = jest.fn()
        component.update()
        instance.handleKeyCommand("underline")

        expect(instance.keyCommandInlineStyle).toBeCalledWith("underline")
      })

      it("Calls #toggleInlineStyle if strikethrough", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        instance.toggleInlineStyle = jest.fn()
        component.update()
        instance.handleKeyCommand("strikethrough")

        expect(instance.toggleInlineStyle).toBeCalledWith("strikethrough")
      })

      it("Returns not-handled for disallowed styles", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        instance.keyCommandInlineStyle = jest.fn()
        instance.toggleInlineStyle = jest.fn()
        component.update()
        instance.handleKeyCommand("code")

        expect(instance.keyCommandInlineStyle).not.toBeCalled()
        expect(instance.toggleInlineStyle).not.toBeCalled()
      })
    })
  })

  describe("#keyCommandBlockType", () => {
    beforeEach(() => {
      props.html = "<p>A piece of text</p>"
    })

    it("Returns not-handled for disallowed blocks", () => {
      props.allowedBlocks = ["p"]
      const component = getWrapper()
      const instance = component.instance() as RichText
      const selectedState = applySelectionToEditorState(
        instance.state.editorState
      )
      instance.onChange(selectedState)
      instance.keyCommandBlockType("header-one")

      expect(instance.state.html).toBe("<p>A piece of text</p>")
      expect(instance.props.onChange).not.toHaveBeenCalled()
    })

    describe("H1", () => {
      it("Can create h1 blocks", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        // Set text selection
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.keyCommandBlockType("header-one")

        expect(instance.state.html).toBe("<h1>A piece of text</h1>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })

      it("Can remove existing h1 blocks", () => {
        props.html = "<h1>A piece of text</h1>"
        const component = getWrapper()
        const instance = component.instance() as RichText
        // Set text selection
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.keyCommandBlockType("header-one")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })
    })

    describe("H2", () => {
      it("Can create h2 blocks", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        // Set text selection
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.keyCommandBlockType("header-two")

        expect(instance.state.html).toBe("<h2>A piece of text</h2>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })

      it("Can remove existing h2 blocks", () => {
        props.html = "<h2>A piece of text</h2>"
        const component = getWrapper()
        const instance = component.instance() as RichText
        // Set text selection
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.keyCommandBlockType("header-two")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })
    })

    describe("H3", () => {
      it("Can create h3 blocks", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        // Set text selection
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.keyCommandBlockType("header-three")

        expect(instance.state.html).toBe("<h3>A piece of text</h3>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })

      it("Can remove existing h3 blocks", () => {
        props.html = "<h3>A piece of text</h3>"
        const component = getWrapper()
        const instance = component.instance() as RichText
        // Set text selection
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.keyCommandBlockType("header-three")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })
    })

    describe("OL", () => {
      it("Can create OL blocks", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        // Set text selection
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.keyCommandBlockType("ordered-list-item")

        expect(instance.state.html).toBe("<ol><li>A piece of text</li></ol>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })

      it("Can remove existing OL blocks", () => {
        props.html = "<ol><li>A piece of text</li></ol>"
        const component = getWrapper()
        const instance = component.instance() as RichText
        // Set text selection
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.keyCommandBlockType("ordered-list-item")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })
    })

    describe("UL", () => {
      it("Can create UL blocks", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        // Set text selection
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.keyCommandBlockType("unordered-list-item")

        expect(instance.state.html).toBe("<ul><li>A piece of text</li></ul>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })

      it("Can remove existing UL blocks", () => {
        props.html = "<ul><li>A piece of text</li></ul>"
        const component = getWrapper()
        const instance = component.instance() as RichText
        // Set text selection
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.keyCommandBlockType("unordered-list-item")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })
    })

    describe("Blockquote", () => {
      it("Can create blockquote blocks", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        // Set text selection
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.keyCommandBlockType("blockquote")

        expect(instance.state.html).toBe(
          "<blockquote>A piece of text</blockquote>"
        )
        expect(instance.props.onChange).toHaveBeenCalled()
        expect(props.onHandleBlockQuote).toHaveBeenCalled()
      })

      it("Can remove existing blockquote blocks", () => {
        props.html = "<blockquote>A piece of text</blockquote>"
        const component = getWrapper()
        const instance = component.instance() as RichText
        // Set text selection
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.keyCommandBlockType("blockquote")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).toHaveBeenCalled()
        expect(props.onHandleBlockQuote).not.toHaveBeenCalled()
      })
    })
  })

  describe("#toggleBlockType", () => {
    beforeEach(() => {
      props.html = "<p>A piece of text</p>"
    })

    it("Does nothing for disallowed blocks", () => {
      props.allowedBlocks = ["p"]
      const component = getWrapper()
      const instance = component.instance() as RichText
      const selectedState = applySelectionToEditorState(
        instance.state.editorState
      )
      instance.onChange(selectedState)
      instance.toggleBlockType("header-one")

      expect(instance.state.html).toBe("<p>A piece of text</p>")
      expect(instance.props.onChange).not.toHaveBeenCalled()
    })

    describe("H1", () => {
      it("Can create h1 blocks", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        // Set text selection
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.toggleBlockType("header-one")

        expect(instance.state.html).toBe("<h1>A piece of text</h1>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })

      it("Can remove existing h1 blocks", () => {
        props.html = "<h1>A piece of text</h1>"
        const component = getWrapper()
        const instance = component.instance() as RichText
        // Set text selection
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.toggleBlockType("header-one")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })
    })

    describe("H2", () => {
      it("Can create h2 blocks", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        // Set text selection
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.toggleBlockType("header-two")

        expect(instance.state.html).toBe("<h2>A piece of text</h2>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })

      it("Can remove existing h2 blocks", () => {
        props.html = "<h2>A piece of text</h2>"
        const component = getWrapper()
        const instance = component.instance() as RichText
        // Set text selection
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.toggleBlockType("header-two")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })
    })

    describe("H3", () => {
      it("Can create h3 blocks", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        // Set text selection
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.toggleBlockType("header-three")

        expect(instance.state.html).toBe("<h3>A piece of text</h3>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })

      it("Can remove existing h2 blocks", () => {
        props.html = "<h3>A piece of text</h3>"
        const component = getWrapper()
        const instance = component.instance() as RichText
        // Set text selection
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.toggleBlockType("header-three")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })
    })

    describe("OL", () => {
      it("Can create ol blocks", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        // Set text selection
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.toggleBlockType("ordered-list-item")

        expect(instance.state.html).toBe("<ol><li>A piece of text</li></ol>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })

      it("Can remove existing ol blocks", () => {
        props.html = "<ol><li>A piece of text</li></ol>"
        const component = getWrapper()
        const instance = component.instance() as RichText
        // Set text selection
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.toggleBlockType("ordered-list-item")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })
    })

    describe("UL", () => {
      it("Can create ul blocks", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        // Set text selection
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.toggleBlockType("unordered-list-item")

        expect(instance.state.html).toBe("<ul><li>A piece of text</li></ul>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })

      it("Can remove existing ul blocks", () => {
        props.html = "<ul><li>A piece of text</li></ul>"
        const component = getWrapper()
        const instance = component.instance() as RichText
        // Set text selection
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.toggleBlockType("unordered-list-item")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })
    })

    describe("Blockquote", () => {
      it("Can create blockquote blocks", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        // Set text selection
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.toggleBlockType("blockquote")

        expect(instance.state.html).toBe(
          "<blockquote>A piece of text</blockquote>"
        )
        expect(instance.props.onChange).toHaveBeenCalled()
        expect(props.onHandleBlockQuote).toHaveBeenCalled()
      })

      it("Can remove existing blockquote blocks", () => {
        props.html = "<blockquote>A piece of text</blockquote>"
        const component = getWrapper()
        const instance = component.instance() as RichText
        // Set text selection
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.toggleBlockType("blockquote")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).toHaveBeenCalled()
        expect(props.onHandleBlockQuote).not.toHaveBeenCalled()
      })
    })
  })

  describe("#keyCommandInlineStyle", () => {
    beforeEach(() => {
      props.html = "<p>A piece of text</p>"
    })

    describe("Bold", () => {
      it("Applies bold styles if allowed", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        // Set text selection
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.keyCommandInlineStyle("bold")

        expect(instance.state.html).toBe("<p><b>A piece of text</b></p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })

      it("Does not apply bold styles if not allowed", () => {
        props.allowedStyles = ["I"]
        const component = getWrapper()
        const instance = component.instance() as RichText
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.keyCommandInlineStyle("bold")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).not.toHaveBeenCalled()
      })

      it("Can remove existing bold styles", () => {
        props.html = "<p><b>A piece of text</b></p>"
        const component = getWrapper()
        const instance = component.instance() as RichText
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.keyCommandInlineStyle("bold")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })
    })

    describe("Italic", () => {
      it("Applies italic styles if allowed", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.keyCommandInlineStyle("italic")

        expect(instance.state.html).toBe("<p><i>A piece of text</i></p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })

      it("Does not apply italic styles if not allowed", () => {
        props.allowedStyles = ["B"]
        const component = getWrapper()
        const instance = component.instance() as RichText
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.keyCommandInlineStyle("italic")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).not.toHaveBeenCalled()
      })

      it("Can remove existing italic styles", () => {
        props.html = "<p><i>A piece of text</i></p>"
        const component = getWrapper()
        const instance = component.instance() as RichText
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.keyCommandInlineStyle("italic")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })
    })

    describe("Underline", () => {
      it("Applies underline styles if allowed", () => {
        props.allowedStyles = ["U"]
        const component = getWrapper()
        const instance = component.instance() as RichText
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.keyCommandInlineStyle("underline")

        expect(instance.state.html).toBe("<p><u>A piece of text</u></p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })

      it("Does not apply underline styles if not allowed", () => {
        props.allowedStyles = ["B"]
        const component = getWrapper()
        const instance = component.instance() as RichText
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.keyCommandInlineStyle("underline")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).not.toHaveBeenCalled()
      })

      it("Can remove existing underline styles", () => {
        props.allowedStyles = ["U"]
        props.html = "<p><u>A piece of text</u></p>"
        const component = getWrapper()
        const instance = component.instance() as RichText
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.keyCommandInlineStyle("underline")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })
    })
  })

  describe("#toggleInlineStyle", () => {
    beforeEach(() => {
      props.html = "<p>A piece of text</p>"
    })

    describe("Bold", () => {
      it("Applies bold styles if allowed", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.toggleInlineStyle("BOLD")

        expect(instance.state.html).toBe("<p><b>A piece of text</b></p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })

      it("Does not apply bold styles if not allowed", () => {
        props.allowedStyles = ["I"]
        const component = getWrapper()
        const instance = component.instance() as RichText
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.toggleInlineStyle("BOLD")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).not.toHaveBeenCalled()
      })

      it("Can remove existing bold styles", () => {
        props.html = "<p><b>A piece of text</b></p>"
        const component = getWrapper()
        const instance = component.instance() as RichText
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.toggleInlineStyle("BOLD")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })
    })

    describe("Italic", () => {
      it("Applies italic styles if allowed", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.toggleInlineStyle("ITALIC")

        expect(instance.state.html).toBe("<p><i>A piece of text</i></p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })

      it("Does not apply italic styles if not allowed", () => {
        props.allowedStyles = ["B"]
        const component = getWrapper()
        const instance = component.instance() as RichText
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.toggleInlineStyle("ITALIC")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).not.toHaveBeenCalled()
      })

      it("Can remove existing italic styles", () => {
        props.html = "<p><i>A piece of text</i></p>"
        const component = getWrapper()
        const instance = component.instance() as RichText
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.toggleInlineStyle("ITALIC")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })
    })

    describe("Underline", () => {
      beforeEach(() => {
        props.allowedStyles = ["U"]
      })

      it("Applies underline styles if allowed", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.toggleInlineStyle("UNDERLINE")

        expect(instance.state.html).toBe("<p><u>A piece of text</u></p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })

      it("Does not apply underline styles if not allowed", () => {
        props.allowedStyles = ["B"]
        const component = getWrapper()
        const instance = component.instance() as RichText
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.toggleInlineStyle("UNDERLINE")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).not.toHaveBeenCalled()
      })

      it("Can remove existing underline styles", () => {
        props.html = "<p><u>A piece of text</u></p>"
        const component = getWrapper()
        const instance = component.instance() as RichText
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.toggleInlineStyle("UNDERLINE")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })
    })

    describe("Strikethrough", () => {
      beforeEach(() => {
        props.allowedStyles = ["S"]
      })

      it("Applies strikethrough styles if allowed", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.toggleInlineStyle("STRIKETHROUGH")

        expect(instance.state.html).toBe("<p><s>A piece of text</s></p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })

      it("Does not apply strikethrough styles if not allowed", () => {
        props.allowedStyles = ["B"]
        const component = getWrapper()
        const instance = component.instance() as RichText
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.toggleInlineStyle("STRIKETHROUGH")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).not.toHaveBeenCalled()
      })

      it("Can remove existing strikethrough styles", () => {
        props.html = "<p><s>A piece of text</s></p>"
        const component = getWrapper()
        const instance = component.instance() as RichText
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.toggleInlineStyle("STRIKETHROUGH")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })
    })
  })

  describe("#makePlainText", () => {
    it("strips links from text", () => {
      props.html = "<p><a href='artsy.net'>A link</a></p>"
      const component = getWrapper()
      const instance = component.instance() as RichText
      const selectedState = applySelectionToEditorState(
        instance.state.editorState
      )
      instance.onChange(selectedState)
      instance.makePlainText()

      expect(instance.state.html).toBe("<p>A link</p>")
    })

    it("strips blocks from text", () => {
      props.html = "<h1><a href='artsy.net'>A linked h1</a></h1>"
      const component = getWrapper()
      const instance = component.instance() as RichText
      const selectedState = applySelectionToEditorState(
        instance.state.editorState
      )
      instance.onChange(selectedState)
      instance.makePlainText()

      expect(instance.state.html).toBe("<p>A linked h1</p>")
    })

    it("strips styles from text", () => {
      props.html =
        "<h1><a href='artsy.net'><b>A strong <em>italic linked h1</em></b></a></h1>"
      const component = getWrapper()
      const instance = component.instance() as RichText
      const selectedState = applySelectionToEditorState(
        instance.state.editorState
      )
      instance.onChange(selectedState)
      instance.makePlainText()

      expect(instance.state.html).toBe("<p>A strong italic linked h1</p>")
    })
  })

  describe("#handlePastedText", () => {
    beforeEach(() => {
      props.html = "<p>A piece of text</p>"
    })

    it("Can paste plain text", () => {
      const component = getWrapper()
      const instance = component.instance() as RichText
      instance.handlePastedText("Some pasted text...")

      expect(instance.state.html).toBe(
        "<p>Some pasted text...A piece of text</p>"
      )
    })

    it("Can paste html", () => {
      const component = getWrapper()
      const instance = component.instance() as RichText
      instance.handlePastedText("", "<p>Some pasted text...</p>")

      expect(instance.state.html).toBe(
        "<p>Some pasted text...A piece of text</p>"
      )
    })

    it("Removes disallowed blocks from pasted content", () => {
      const component = getWrapper()
      const instance = component.instance() as RichText
      instance.handlePastedText("", htmlWithRichBlocks)

      expect(instance.state.html).toBe(
        '<p><a href="https://artsy.net/">a link</a></p><h1>an h1</h1><h2>an h2</h2><h3>an h3</h3><p>an h4</p><p>an h5</p><p>an h6</p><ul><li>unordered list</li><li>second list item</li></ul><ol><li>ordered list</li></ol><blockquote>a blockquoteA piece of text</blockquote>'
      )
    })

    it("Removes disallowed styles from pasted content", () => {
      const component = getWrapper()
      const instance = component.instance() as RichText
      instance.handlePastedText("", htmlWithDisallowedStyles)

      expect(instance.state.html).toBe(
        "<p><s>Strikethrough text</s> Code text Underline text <i>Italic text</i> <i>Italic text</i> <b>Bold text</b> <b>Bold text</b>A piece of text</p>"
      )
    })

    it("Strips linebreaks from pasted content", () => {
      props.stripLinebreaks = true
      const component = getWrapper()
      const instance = component.instance() as RichText
      instance.handlePastedText("", htmlWithRichBlocks)

      expect(instance.state.html).toBe(
        '<p><a href="https://artsy.net/">a link</a></p><h1>an h1</h1><h2>an h2</h2><h3>an h3</h3><p>an h4</p><p>an h5</p><p>an h6</p><ul><li>unordered list</li><li>second list item</li></ul><ol><li>ordered list</li></ol><blockquote>a blockquoteA piece of text</blockquote>'
      )
    })
  })

  describe("Links", () => {
    beforeEach(() => {
      props.hasLinks = true

      window.getSelection = jest.fn().mockReturnValue({
        isCollapsed: false,
        getRangeAt,
      })
    })

    describe("#promptForLink", () => {
      it("Sets editorPosition", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        instance.promptForLink()

        expect(instance.state.editorPosition).toEqual({
          bottom: 0,
          height: 0,
          left: 0,
          right: 0,
          top: 0,
          width: 0,
        })
      })

      it("Sets urlValue with data", () => {
        props.html = '<p><a href="https://artsy.net">A link</a></p>'
        const component = getWrapper()
        const instance = component.instance() as RichText
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)

        instance.promptForLink()
        expect(instance.state.urlValue).toBe("https://artsy.net/")
      })

      it("Sets urlValue without data", () => {
        props.html = "<p>A piece of text</p>"
        const component = getWrapper()
        const instance = component.instance() as RichText
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.promptForLink()

        expect(instance.state.urlValue).toBe("")
      })

      it("Hides nav", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.checkSelection()
        expect(instance.state.showNav).toBe(true)

        instance.promptForLink()
        expect(instance.state.showNav).toBe(false)
      })

      it("Shows url input", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.promptForLink()

        expect(instance.state.showUrlInput).toBe(true)
      })
    })

    describe("#confirmLink", () => {
      it("Sets editorPosition to null", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)

        instance.confirmLink("https://artsy.net/articles")
        expect(instance.state.editorPosition).toBe(null)
      })

      it("Sets urlValue to empty string", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.confirmLink("https://artsy.net/articles")

        expect(instance.state.urlValue).toBe("")
      })

      it("Hides nav and url input", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.confirmLink("https://artsy.net/articles")

        expect(instance.state.showNav).toBe(false)
        expect(instance.state.showUrlInput).toBe(false)
      })

      it("Adds a link to selected text", () => {
        props.html = "<p>A piece of text</p>"
        const component = getWrapper()
        const instance = component.instance() as RichText
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.confirmLink("https://artsy.net/articles")

        expect(instance.state.html).toBe(
          '<p><a href="https://artsy.net/articles">A piece of text</a></p>'
        )
      })
    })

    describe("#removeLink", () => {
      beforeEach(() => {
        props.html = '<p><a href="https://artsy.net">A link</a></p>'
      })

      it("Removes a link from selected entity", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.removeLink()

        expect(instance.state.html).toBe("<p>A link</p>")
      })

      it("Hides url input", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.removeLink()

        expect(instance.state.showUrlInput).toBe(false)
      })

      it("Sets urlValue to empty string", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        const selectedState = applySelectionToEditorState(
          instance.state.editorState
        )
        instance.onChange(selectedState)
        instance.removeLink()

        expect(instance.state.urlValue).toBe("")
      })
    })
  })

  describe("#checkSelection", () => {
    describe("Has selection", () => {
      beforeEach(() => {
        window.getSelection = jest.fn().mockReturnValue({
          isCollapsed: false,
          getRangeAt,
        })
      })

      it("Sets editorPosition if has selection", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        instance.checkSelection()

        expect(instance.state.editorPosition).toEqual({
          bottom: 0,
          height: 0,
          left: 0,
          right: 0,
          top: 0,
          width: 0,
        })
      })

      it("Shows nav if has selection", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        instance.checkSelection()

        expect(instance.state.showNav).toBe(true)
      })
    })

    describe("No selection", () => {
      beforeEach(() => {
        window.getSelection = jest.fn().mockReturnValue({
          isCollapsed: true,
        })
      })

      it("Resets editorPosition to null if no selection", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        component.setState({ editorPosition: { top: 50, left: 100 } })
        instance.checkSelection()

        expect(instance.state.editorPosition).toBe(null)
      })

      it("Hides nav if no selection", () => {
        const component = getWrapper()
        const instance = component.instance() as RichText
        component.setState({
          showNav: true,
          editorPosition: { top: 50, left: 100 },
        })
        instance.checkSelection()

        expect(instance.state.showNav).toBe(false)
      })
    })
  })
})
