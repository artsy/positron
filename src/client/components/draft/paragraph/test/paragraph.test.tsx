import {
  htmlWithDisallowedStyles,
  htmlWithRichBlocks,
} from "client/components/draft/shared/test_helpers"
import { convertFromHTML } from "draft-convert"
import { EditorState, SelectionState } from "draft-js"
import Draft from "draft-js"
import { mount } from "enzyme"
import React from "react"
import { decorators } from "../../shared/decorators"
import { Paragraph } from "../paragraph"

jest.mock("lodash/debounce", () => jest.fn(e => e))

Draft.getVisibleSelectionRect = jest.fn().mockReturnValue({
  bottom: 170,
  height: 25,
  left: 425,
  right: 525,
  top: 145,
  width: 95,
})

jest.mock("../../../rich_text/utils/text_selection", () => ({
  getSelectionDetails: jest.fn().mockReturnValue({
    anchorOffset: 0,
    isFirstBlock: true,
  }),
}))

describe("Paragraph", () => {
  let getSelection

  const getWrapper = (passedProps = props) => {
    return mount(<Paragraph {...passedProps} />)
  }

  let props
  beforeEach(() => {
    props = {
      html: "<p>A piece of text</p>",
      hasLinks: false,
      onChange: jest.fn(),
      stripLinebreaks: false,
    }
    delete props.allowedStyles
  })

  getSelection = getLast => {
    const component = getWrapper(props)
    const instance = component.instance() as Paragraph
    const startSelection = instance.state.editorState.getSelection()
    const startEditorState = instance.state.editorState.getCurrentContent()
    // TODO: update to work with new enzyme types
    // @ts-ignore
    const { key, text } = getLast
      ? startEditorState.getLastBlock()
      : startEditorState.getFirstBlock()
    const anchorOffset = getLast ? text.length : 0

    const selection = startSelection.merge({
      anchorKey: key,
      anchorOffset,
      focusKey: key,
      focusOffset: text.length,
    })
    return EditorState.acceptSelection(
      instance.state.editorState,
      selection as SelectionState
    )
  }

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
        props.placeholder = "Write something..."
        const component = getWrapper()

        expect(component.text()).toBe("Write something...")
      })
    })

    describe("Create with content", () => {
      it("Can initialize with existing content", () => {
        const component = getWrapper()
        expect(component.text()).toBe("A piece of text")
      })

      it("Can initialize existing content with decorators", () => {
        props.hasLinks = true
        props.html = '<p>A <a href="https://artsy.net">piece</a> of text</p>'
        const component = getWrapper()

        expect(component.text()).toBe("A piece of text")
        expect(component.html()).toMatch('<a href="https://artsy.net/">')
      })
    })
  })

  describe("#editorStateFromHTML", () => {
    it("Removes disallowed blocks", () => {
      props.html = htmlWithRichBlocks
      props.hasLinks = true
      const component = getWrapper()
      const instance = component.instance() as Paragraph
      const editorState = instance.editorStateFromHTML(component.props().html)
      instance.onChange(editorState)

      expect(instance.state.html).toBe(
        '<p><a href="https://artsy.net/">a link</a></p><p>an h1</p><p>an h2</p><p>an h3</p><p>an h4</p><p>an h5</p><p>an h6</p><p>unordered list</p><p>second list item</p><p>ordered list</p><p>a blockquote</p>'
      )
    })

    it("Removes links if props.hasLinks is false", () => {
      props.html = htmlWithRichBlocks
      const component = getWrapper()
      const instance = component.instance() as Paragraph
      const editorState = instance.editorStateFromHTML(component.props().html)
      instance.onChange(editorState)

      expect(instance.state.html).toBe(
        "<p>a link</p><p>an h1</p><p>an h2</p><p>an h3</p><p>an h4</p><p>an h5</p><p>an h6</p><p>unordered list</p><p>second list item</p><p>ordered list</p><p>a blockquote</p>"
      )
    })

    it("Removes empty blocks", () => {
      props.html = "<p>A paragraph</p><p></p><h1></h1><h2></h2>"
      const component = getWrapper()
      const instance = component.instance() as Paragraph
      const editorState = instance.editorStateFromHTML(component.props().html)
      instance.onChange(editorState)

      expect(instance.state.html).toBe("<p>A paragraph</p>")
    })

    it("Preserves empty blocks if props.allowEmptyLines", () => {
      props.allowEmptyLines = true
      props.html = "<p>A paragraph</p><p></p><h1></h1><h2></h2>"
      const component = getWrapper()
      const instance = component.instance() as Paragraph
      const editorState = instance.editorStateFromHTML(component.props().html)
      instance.onChange(editorState)

      expect(instance.state.html).toBe(
        "<p>A paragraph</p><p><br /></p><p><br /></p><p><br /></p>"
      )
    })

    it("Removes disallowed styles", () => {
      props.html = htmlWithDisallowedStyles
      const component = getWrapper()
      const instance = component.instance() as Paragraph
      const editorState = instance.editorStateFromHTML(component.props().html)
      instance.onChange(editorState)

      expect(instance.state.html).toBe(
        "<p>Strikethrough text Code text Underline text <i>Italic text</i> <i>Italic text</i> <b>Bold text</b> <b>Bold text</b></p>"
      )
    })

    it("Calls #stripGoogleStyles", () => {
      props.html =
        '<b style="font-weight:normal;" id="docs-internal-guid-ce2bb19a-cddb-9e53-cb18-18e71847df4e"><p><span style="font-size:11pt;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">Available at: <em>Espacio Valverde</em> • Galleries Sector, Booth 9F01</span></p>'
      const component = getWrapper()
      const instance = component.instance() as Paragraph
      const editorState = instance.editorStateFromHTML(component.props().html)
      instance.onChange(editorState)

      expect(instance.state.html).toBe(
        "<p>Available at: <i>Espacio Valverde</i> • Galleries Sector, Booth 9F01</p>"
      )
    })

    it("Strips linebreaks if props.stripLinebreaks", () => {
      props.stripLinebreaks = true
      props.hasLinks = true
      props.html = htmlWithRichBlocks
      const component = getWrapper()
      const instance = component.instance() as Paragraph
      const editorState = instance.editorStateFromHTML(component.props().html)
      instance.onChange(editorState)

      expect(instance.state.html).toBe(
        '<p><a href="https://artsy.net/">a link</a> an h1 an h2 an h3 an h4 an h5 an h6 unordered list second list item ordered list a blockquote</p>'
      )
    })
  })

  describe("#editorStateToHtml", () => {
    it("Removes disallowed blocks from existing content", () => {
      const disallowedBlocks = convertFromHTML({})(htmlWithRichBlocks)
      const editorState = EditorState.createWithContent(
        disallowedBlocks,
        decorators(false)
      )
      const component = getWrapper().instance() as Paragraph
      const html = component.editorStateToHTML(editorState)

      expect(html).toBe(
        "<p>a link</p><p>an h1</p><p>an h2</p><p>an h3</p><p>an h4</p><p>an h5</p><p>an h6</p><p>unordered list</p><p>second list item</p><p>ordered list</p><p>a blockquote</p>"
      )
    })

    it("Removes disallowed styles from existing content", () => {
      const disallowedStyles = convertFromHTML({})(htmlWithDisallowedStyles)
      const editorState = EditorState.createWithContent(disallowedStyles)
      const component = getWrapper().instance() as Paragraph
      const html = component.editorStateToHTML(editorState)

      expect(html).toBe(
        "<p>Strikethrough text Code text Underline text <i>Italic text</i> <i>Italic text</i> <b>Bold text</b> <b>Bold text</b></p>"
      )
    })
  })

  describe("#onChange", () => {
    it("Sets state with new editorState and html", () => {
      const editorContent = convertFromHTML({})("<p>A new piece of text.</p>")
      const editorState = EditorState.createWithContent(editorContent)
      const component = getWrapper()
      const instance = component.instance() as Paragraph
      const originalState = instance.state.editorState
      instance.onChange(editorState)

      expect(instance.state.html).toBe("<p>A new piece of text.</p>")
      expect(instance.state.editorState).not.toBe(originalState)
    })

    it("Calls props.onChange if html is changed", () => {
      const editorContent = convertFromHTML({})("<p>A new piece of text.</p>")
      const editorState = EditorState.createWithContent(editorContent)
      const component = getWrapper()
      const instance = component.instance() as Paragraph
      instance.onChange(editorState)

      expect(instance.state.html).toBe("<p>A new piece of text.</p>")
      expect(instance.props.onChange).toHaveBeenCalled()
    })

    it("Does not call props.onChange if html is unchanged", () => {
      const editorContent = convertFromHTML({})(props.html)
      const editorState = EditorState.createWithContent(editorContent)
      const component = getWrapper()
      const instance = component.instance() as Paragraph
      instance.setState = jest.fn()
      component.update()
      instance.onChange(editorState)

      expect(component.instance().setState).toBeCalled()
      expect(instance.props.onChange).not.toHaveBeenCalled()
    })
  })

  describe("#handleKeyCommand", () => {
    it("Calls #promptForLink if link-prompt and props.hasLinks", () => {
      props.hasLinks = true
      const component = getWrapper()
      const instance = component.instance() as Paragraph
      instance.promptForLink = jest.fn()
      component.update()
      instance.handleKeyCommand("link-prompt")

      expect(instance.promptForLink).toBeCalled()
    })

    it("Returns not-handled if link-prompt and props.hasLinks is false", () => {
      const component = getWrapper()
      const instance = component.instance() as Paragraph
      instance.promptForLink = jest.fn()
      component.update()
      const handleKeyCommand = instance.handleKeyCommand("link-prompt")

      expect(instance.promptForLink).not.toBeCalled()
      expect(handleKeyCommand).toBe("not-handled")
    })

    it("Calls #keyCommandInlineStyle if bold", () => {
      const component = getWrapper()
      const instance = component.instance() as Paragraph
      instance.keyCommandInlineStyle = jest.fn()
      component.update()
      instance.handleKeyCommand("bold")

      expect(instance.keyCommandInlineStyle).toBeCalledWith("bold")
    })

    it("Calls #keyCommandInlineStyle if italic", () => {
      const component = getWrapper()
      const instance = component.instance() as Paragraph
      instance.keyCommandInlineStyle = jest.fn()
      component.update()
      instance.handleKeyCommand("italic")

      expect(instance.keyCommandInlineStyle).toBeCalledWith("italic")
    })

    it("Returns not-handled from anything else", () => {
      const component = getWrapper()
      const instance = component.instance() as Paragraph
      instance.keyCommandInlineStyle = jest.fn()
      component.update()
      instance.handleKeyCommand("underline")

      expect(instance.keyCommandInlineStyle).not.toBeCalled()
    })
  })

  describe("#handleReturn", () => {
    it("Returns handled if props.stripLinebreaks", () => {
      props.stripLinebreaks = true
      const component = getWrapper().instance() as Paragraph
      const handleReturn = component.handleReturn({})

      expect(handleReturn).toBe("handled")
    })

    it("Returns not-handled if linebreaks are allowed", () => {
      const component = getWrapper().instance() as Paragraph
      const handleReturn = component.handleReturn({})

      expect(handleReturn).toBe("not-handled")
    })

    it("Returns not-handled if allowEmptyLines", () => {
      props.allowEmptyLines = true
      const component = getWrapper().instance() as Paragraph
      const handleReturn = component.handleReturn({})

      expect(handleReturn).toBe("not-handled")
    })
  })

  describe("#keyCommandInlineStyle", () => {
    describe("Bold", () => {
      it("Applies bold styles if allowed", () => {
        const component = getWrapper()
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())
        instance.keyCommandInlineStyle("bold")

        expect(instance.state.html).toBe("<p><b>A piece of text</b></p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })

      it("Does not apply bold styles if not allowed", () => {
        props.allowedStyles = ["i"]
        const component = getWrapper()
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())
        instance.keyCommandInlineStyle("bold")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).not.toHaveBeenCalled()
      })

      it("Can remove existing bold styles", () => {
        props.html = "<p><b>A piece of text</b></p>"
        const component = getWrapper()
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())
        instance.keyCommandInlineStyle("bold")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })
    })

    describe("Italic", () => {
      it("Applies italic styles if allowed", () => {
        const component = getWrapper()
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())
        instance.keyCommandInlineStyle("italic")

        expect(instance.state.html).toBe("<p><i>A piece of text</i></p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })

      it("Does not apply italic styles if not allowed", () => {
        props.allowedStyles = ["b"]
        const component = getWrapper()
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())
        instance.keyCommandInlineStyle("italic")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).not.toHaveBeenCalled()
      })

      it("Can remove existing italic styles", () => {
        props.html = "<p><i>A piece of text</i></p>"
        const component = getWrapper()
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())
        instance.keyCommandInlineStyle("italic")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })
    })
  })

  describe("#toggleInlineStyle", () => {
    describe("Bold", () => {
      it("Applies bold styles if allowed", () => {
        const component = getWrapper()
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())
        instance.toggleInlineStyle("BOLD")

        expect(instance.state.html).toBe("<p><b>A piece of text</b></p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })

      it("Does not apply bold styles if not allowed", () => {
        props.allowedStyles = ["i"]
        const component = getWrapper()
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())
        instance.toggleInlineStyle("BOLD")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).not.toHaveBeenCalled()
      })

      it("Can remove existing bold styles", () => {
        props.html = "<p><b>A piece of text</b></p>"
        const component = getWrapper()
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())
        instance.toggleInlineStyle("BOLD")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })
    })

    describe("Italic", () => {
      it("Applies italic styles if allowed", () => {
        const component = getWrapper()
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())
        instance.toggleInlineStyle("ITALIC")

        expect(instance.state.html).toBe("<p><i>A piece of text</i></p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })

      it("Does not apply italic styles if not allowed", () => {
        props.allowedStyles = ["b"]
        const component = getWrapper()
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())
        instance.toggleInlineStyle("ITALIC")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).not.toHaveBeenCalled()
      })

      it("Can remove existing italic styles", () => {
        props.html = "<p><i>A piece of text</i></p>"
        const component = getWrapper()
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())
        instance.toggleInlineStyle("ITALIC")

        expect(instance.state.html).toBe("<p>A piece of text</p>")
        expect(instance.props.onChange).toHaveBeenCalled()
      })
    })
  })

  describe("#handlePastedText", () => {
    it("Can paste plain text", () => {
      const component = getWrapper()
      const instance = component.instance() as Paragraph
      instance.handlePastedText("Some pasted text...")

      expect(instance.state.html).toBe(
        "<p>Some pasted text...A piece of text</p>"
      )
    })

    it("Can paste html", () => {
      const component = getWrapper()
      const instance = component.instance() as Paragraph
      instance.handlePastedText("", "<p>Some pasted text...</p>")

      expect(instance.state.html).toBe(
        "<p>Some pasted text...A piece of text</p>"
      )
    })

    it("Removes disallowed blocks from pasted content", () => {
      const component = getWrapper()
      const instance = component.instance() as Paragraph
      instance.handlePastedText("", htmlWithRichBlocks)

      expect(instance.state.html).toBe(
        "<p>a link</p><p>an h1</p><p>an h2</p><p>an h3</p><p>an h4</p><p>an h5</p><p>an h6</p><p>unordered list</p><p>second list item</p><p>ordered list</p><p>a blockquoteA piece of text</p>"
      )
    })

    it("Removes disallowed styles from pasted content", () => {
      const component = getWrapper()
      const instance = component.instance() as Paragraph
      instance.handlePastedText("", htmlWithDisallowedStyles)

      expect(instance.state.html).toBe(
        "<p>Strikethrough text Code text Underline text <i>Italic text</i> <i>Italic text</i> <b>Bold text</b> <b>Bold text</b>A piece of text</p>"
      )
    })

    it("Strips linebreaks from pasted content", () => {
      props.stripLinebreaks = true
      const component = getWrapper()
      const instance = component.instance() as Paragraph
      instance.handlePastedText("", htmlWithRichBlocks)

      expect(instance.state.html).toBe(
        "<p>a link an h1 an h2 an h3 an h4 an h5 an h6 unordered list second list item ordered list a blockquoteA piece of text</p>"
      )
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
        const instance = component.instance() as Paragraph
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
        const instance = component.instance() as Paragraph
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
        const instance = component.instance() as Paragraph
        component.setState({ editorPosition: { top: 50, left: 100 } })
        instance.checkSelection()

        expect(instance.state.editorPosition).toBe(null)
      })

      it("Hides nav if no selection", () => {
        const component = getWrapper()
        const instance = component.instance() as Paragraph
        component.setState({
          showNav: true,
          editorPosition: { top: 50, left: 100 },
        })
        instance.checkSelection()

        expect(instance.state.showNav).toBe(false)
      })
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
        const instance = component.instance() as Paragraph
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
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())
        instance.promptForLink()

        expect(instance.state.urlValue).toBe("https://artsy.net/")
      })

      it("Sets urlValue without data", () => {
        const component = getWrapper()
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())
        instance.promptForLink()

        expect(instance.state.urlValue).toBe("")
      })

      it("Hides nav", () => {
        const component = getWrapper()
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())
        instance.checkSelection()
        expect(instance.state.showNav).toBe(true)

        instance.promptForLink()
        expect(instance.state.showNav).toBe(false)
      })

      it("Shows url input", () => {
        const component = getWrapper()
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())
        instance.promptForLink()

        expect(instance.state.showUrlInput).toBe(true)
      })
    })

    describe("#confirmLink", () => {
      it("Sets editorPosition to null", () => {
        const component = getWrapper()
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())
        instance.confirmLink("https://artsy.net/articles")

        expect(instance.state.editorPosition).toBe(null)
      })

      it("Sets urlValue to empty string", () => {
        const component = getWrapper()
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())
        instance.confirmLink("https://artsy.net/articles")

        expect(instance.state.urlValue).toBe("")
      })

      it("Hides nav and url input", () => {
        const component = getWrapper()
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())
        instance.confirmLink("https://artsy.net/articles")

        expect(instance.state.showNav).toBe(false)
        expect(instance.state.showUrlInput).toBe(false)
      })

      it("Adds a link to selected text", () => {
        const component = getWrapper()
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())
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
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())
        instance.removeLink()

        expect(instance.state.html).toBe("<p>A link</p>")
      })

      it("Hides url input", () => {
        const component = getWrapper()
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())
        instance.removeLink()

        expect(instance.state.showUrlInput).toBe(false)
      })

      it("Sets urlValue to empty string", () => {
        const component = getWrapper()
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())
        instance.removeLink()

        expect(instance.state.urlValue).toBe("")
      })
    })
  })
})
