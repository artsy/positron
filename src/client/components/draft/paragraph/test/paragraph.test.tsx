import { convertFromHTML } from "draft-convert"
import { EditorState } from "draft-js"
import Draft from "draft-js"
import { mount } from "enzyme"
import React from "react"
import { Paragraph } from "../paragraph"
import { decorators } from "../utils/decorators"

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

  const getWrapper = passedProps => {
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
    const startSelection = component.state().editorState.getSelection()
    const startEditorState = component.state().editorState.getCurrentContent()
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
    return EditorState.acceptSelection(component.state().editorState, selection)
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

  const htmlWithRichBlocks = `
    <meta><title>Page Title</title></meta>
    <script>do a bad thing</script>
    <p><a href="https://artsy.net">a link</a></p>
    <p></p>
    <h1>an h1</h1>
    <h2>an h2</h2>
    <h3>an h3</h3>
    <h4>an h4</h4>
    <h5>an h5</h5>
    <h6>an h6</h6>
    <ul><li>unordered list</li><li>second list item</li></ul>
    <ol><li>ordered list</li></ol>
    <blockquote>a blockquote</blockquote>`

  const htmlWithDisallowedStyles = `
    <p><del>Strikethrough text</del>
    <u>Underline text</u>
    <em>Italic text</em>
    <i>Italic text</i>
    <strong>Bold text</strong>
    <b>Bold text</b></p>`

  describe("#setEditorState", () => {
    describe("Create from empty", () => {
      it("Can initialize an empty state", () => {
        props.html = null
        props.placeholder = "Write something..."
        const component = getWrapper(props)

        expect(component.text()).toBe("Write something...")
      })
    })

    describe("Create with content", () => {
      it("Can initialize with existing content", () => {
        const component = getWrapper(props)
        expect(component.text()).toBe("A piece of text")
      })

      it("Can initialize existing content with decorators", () => {
        props.hasLinks = true
        props.html = '<p>A <a href="https://artsy.net">piece</a> of text</p>'
        const component = getWrapper(props)

        expect(component.text()).toBe("A piece of text")
        expect(component.html()).toMatch('<a href="https://artsy.net/">')
      })
    })
  })

  describe("#editorStateFromHTML", () => {
    it("Removes disallowed blocks", () => {
      props.html = htmlWithRichBlocks
      props.hasLinks = true
      const component = getWrapper(props)
      const instance = component.instance() as Paragraph
      const editorState = instance.editorStateFromHTML(component.props().html)
      instance.onChange(editorState)

      expect(component.state().html).toBe(
        '<p><a href="https://artsy.net/">a link</a></p><p>an h1</p><p>an h2</p><p>an h3</p><p>an h4</p><p>an h5</p><p>an h6</p><p>unordered list</p><p>second list item</p><p>ordered list</p><p>a blockquote</p>'
      )
    })

    it("Removes links if props.hasLinks is false", () => {
      props.html = htmlWithRichBlocks
      const component = getWrapper(props)
      const instance = component.instance() as Paragraph
      const editorState = instance.editorStateFromHTML(component.props().html)
      instance.onChange(editorState)

      expect(component.state().html).toBe(
        "<p>a link</p><p>an h1</p><p>an h2</p><p>an h3</p><p>an h4</p><p>an h5</p><p>an h6</p><p>unordered list</p><p>second list item</p><p>ordered list</p><p>a blockquote</p>"
      )
    })

    it("Removes empty blocks", () => {
      props.html = "<p>A paragraph</p><p></p><h1></h1><h2></h2>"
      const component = getWrapper(props)
      const instance = component.instance() as Paragraph
      const editorState = instance.editorStateFromHTML(component.props().html)
      instance.onChange(editorState)

      expect(component.state().html).toBe("<p>A paragraph</p>")
    })

    it("Removes disallowed styles", () => {
      props.html = htmlWithDisallowedStyles
      const component = getWrapper(props)
      const instance = component.instance() as Paragraph
      const editorState = instance.editorStateFromHTML(component.props().html)
      instance.onChange(editorState)

      expect(component.state().html).toBe(
        "<p>Strikethrough text Underline text <i>Italic text</i> <i>Italic text</i> <b>Bold text</b> <b>Bold text</b></p>"
      )
    })

    it("Calls #stripGoogleStyles", () => {
      props.html =
        '<b style="font-weight:normal;" id="docs-internal-guid-ce2bb19a-cddb-9e53-cb18-18e71847df4e"><p><span style="font-size:11pt;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">Available at: <em>Espacio Valverde</em> • Galleries Sector, Booth 9F01</span></p>'
      const component = getWrapper(props)
      const instance = component.instance() as Paragraph
      const editorState = instance.editorStateFromHTML(component.props().html)
      instance.onChange(editorState)

      expect(component.state().html).toBe(
        "<p>Available at: <i>Espacio Valverde</i> • Galleries Sector, Booth 9F01</p>"
      )
    })

    it("Strips linebreaks if props.stripLinebreaks", () => {
      props.stripLinebreaks = true
      props.hasLinks = true
      props.html = htmlWithRichBlocks
      const component = getWrapper(props)
      const instance = component.instance() as Paragraph
      const editorState = instance.editorStateFromHTML(component.props().html)
      instance.onChange(editorState)

      expect(component.state().html).toBe(
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
      const component = getWrapper(props).instance() as Paragraph
      const html = component.editorStateToHTML(editorState)

      expect(html).toBe(
        "<p>a link</p><p>an h1</p><p>an h2</p><p>an h3</p><p>an h4</p><p>an h5</p><p>an h6</p><p>unordered list</p><p>second list item</p><p>ordered list</p><p>a blockquote</p>"
      )
    })

    it("Removes disallowed styles from existing content", () => {
      const disallowedStyles = convertFromHTML({})(htmlWithDisallowedStyles)
      const editorState = EditorState.createWithContent(disallowedStyles)
      const component = getWrapper(props).instance() as Paragraph
      const html = component.editorStateToHTML(editorState)

      expect(html).toBe(
        "<p>Strikethrough text Underline text <i>Italic text</i> <i>Italic text</i> <b>Bold text</b> <b>Bold text</b></p>"
      )
    })
  })

  describe("#onChange", () => {
    it("Sets state with new editorState and html", () => {
      const editorContent = convertFromHTML({})("<p>A new piece of text.</p>")
      const editorState = EditorState.createWithContent(editorContent)
      const component = getWrapper(props)
      const originalState = component.state().editorState
      const instance = component.instance() as Paragraph
      instance.onChange(editorState)

      expect(component.state().html).toBe("<p>A new piece of text.</p>")
      expect(component.state().editorState).not.toBe(originalState)
    })

    it("Calls props.onChange if html is changed", done => {
      const editorContent = convertFromHTML({})("<p>A new piece of text.</p>")
      const editorState = EditorState.createWithContent(editorContent)
      const component = getWrapper(props)
      const instance = component.instance() as Paragraph
      instance.onChange(editorState)

      expect(component.state().html).toBe("<p>A new piece of text.</p>")
      // Wait for debounced onChange
      setTimeout(() => {
        expect(component.instance().props.onChange).toHaveBeenCalled()
        done()
      }, 250)
    })

    it("Does not call props.onChange if html is unchanged", done => {
      const editorContent = convertFromHTML({})(props.html)
      const editorState = EditorState.createWithContent(editorContent)
      const component = getWrapper(props)
      const instance = component.instance() as Paragraph
      instance.setState = jest.fn()
      component.update()
      instance.onChange(editorState)

      setTimeout(() => {
        expect(component.instance().setState).toBeCalled()
        expect(component.instance().props.onChange).not.toHaveBeenCalled()
        done()
      }, 250)
    })
  })

  describe("#handleKeyCommand", () => {
    it("Calls #promptForLink if link-prompt and props.hasLinks", () => {
      props.hasLinks = true
      const component = getWrapper(props)
      const instance = component.instance() as Paragraph
      instance.promptForLink = jest.fn()
      component.update()
      instance.handleKeyCommand("link-prompt")

      expect(instance.promptForLink).toBeCalled()
    })

    it("Returns not-handled if link-prompt and props.hasLinks is false", () => {
      const component = getWrapper(props)
      const instance = component.instance() as Paragraph
      instance.promptForLink = jest.fn()
      component.update()
      const handleKeyCommand = instance.handleKeyCommand("link-prompt")

      expect(instance.promptForLink).not.toBeCalled()
      expect(handleKeyCommand).toBe("not-handled")
    })

    it("Calls #keyCommandInlineStyle if bold", () => {
      const component = getWrapper(props)
      const instance = component.instance() as Paragraph
      instance.keyCommandInlineStyle = jest.fn()
      component.update()
      instance.handleKeyCommand("bold")

      expect(instance.keyCommandInlineStyle).toBeCalledWith("bold")
    })

    it("Calls #keyCommandInlineStyle if italic", () => {
      const component = getWrapper(props)
      const instance = component.instance() as Paragraph
      instance.keyCommandInlineStyle = jest.fn()
      component.update()
      instance.handleKeyCommand("italic")

      expect(instance.keyCommandInlineStyle).toBeCalledWith("italic")
    })

    it("Returns not-handled from anything else", () => {
      const component = getWrapper(props)
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
      const component = getWrapper(props).instance() as Paragraph
      const handleReturn = component.handleReturn({})

      expect(handleReturn).toBe("handled")
    })

    it("Returns not-handled if linebreaks are allowed", () => {
      const component = getWrapper(props).instance() as Paragraph
      const handleReturn = component.handleReturn({})

      expect(handleReturn).toBe("not-handled")
    })
  })

  describe("#keyCommandInlineStyle", () => {
    describe("Bold", () => {
      it("Applies bold styles if allowed", done => {
        const component = getWrapper(props)
        const instance = component.instance() as Paragraph
        // Set text selection
        instance.onChange(getSelection())
        // Wait for debounced onChange
        setTimeout(() => {
          instance.keyCommandInlineStyle("bold")
          expect(component.state().html).toBe("<p><b>A piece of text</b></p>")
          // Wait for second debounced onChange
          setTimeout(() => {
            expect(instance.props.onChange).toHaveBeenCalled()
            done()
          }, 250)
        }, 250)
      })

      it("Does not apply bold styles if not allowed", done => {
        props.allowedStyles = ["i"]
        const component = getWrapper(props)
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())

        setTimeout(() => {
          instance.keyCommandInlineStyle("bold")
          expect(component.state().html).toBe("<p>A piece of text</p>")
          setTimeout(() => {
            expect(instance.props.onChange).not.toHaveBeenCalled()
            done()
          }, 250)
        }, 250)
      })

      it("Can remove existing bold styles", done => {
        props.html = "<p><b>A piece of text</b></p>"
        const component = getWrapper(props)
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())

        setTimeout(() => {
          instance.keyCommandInlineStyle("bold")
          expect(component.state().html).toBe("<p>A piece of text</p>")
          setTimeout(() => {
            expect(instance.props.onChange).toHaveBeenCalled()
            done()
          }, 250)
        }, 250)
      })
    })

    describe("Italic", () => {
      it("Applies italic styles if allowed", done => {
        const component = getWrapper(props)
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())

        setTimeout(() => {
          instance.keyCommandInlineStyle("italic")
          expect(component.state().html).toBe("<p><i>A piece of text</i></p>")
          setTimeout(() => {
            expect(instance.props.onChange).toHaveBeenCalled()
            done()
          }, 250)
        }, 250)
      })

      it("Does not apply italic styles if not allowed", done => {
        props.allowedStyles = ["b"]
        const component = getWrapper(props)
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())

        setTimeout(() => {
          instance.keyCommandInlineStyle("italic")
          expect(component.state().html).toBe("<p>A piece of text</p>")
          setTimeout(() => {
            expect(instance.props.onChange).not.toHaveBeenCalled()
            done()
          }, 250)
        }, 250)
      })

      it("Can remove existing italic styles", done => {
        props.html = "<p><i>A piece of text</i></p>"
        const component = getWrapper(props)
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())

        setTimeout(() => {
          instance.keyCommandInlineStyle("italic")
          expect(component.state().html).toBe("<p>A piece of text</p>")
          setTimeout(() => {
            expect(instance.props.onChange).toHaveBeenCalled()
            done()
          }, 250)
        }, 250)
      })
    })
  })

  describe("#toggleInlineStyle", () => {
    describe("Bold", () => {
      it("Applies bold styles if allowed", done => {
        const component = getWrapper(props)
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())

        setTimeout(() => {
          instance.toggleInlineStyle("BOLD")
          expect(component.state().html).toBe("<p><b>A piece of text</b></p>")
          setTimeout(() => {
            expect(instance.props.onChange).toHaveBeenCalled()
            done()
          }, 250)
        }, 250)
      })

      it("Does not apply bold styles if not allowed", done => {
        props.allowedStyles = ["i"]
        const component = getWrapper(props)
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())

        setTimeout(() => {
          instance.toggleInlineStyle("BOLD")
          expect(component.state().html).toBe("<p>A piece of text</p>")
          setTimeout(() => {
            expect(instance.props.onChange).not.toHaveBeenCalled()
            done()
          }, 250)
        }, 250)
      })

      it("Can remove existing bold styles", done => {
        props.html = "<p><b>A piece of text</b></p>"
        const component = getWrapper(props)
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())

        setTimeout(() => {
          instance.toggleInlineStyle("BOLD")
          expect(component.state().html).toBe("<p>A piece of text</p>")
          setTimeout(() => {
            expect(instance.props.onChange).toHaveBeenCalled()
            done()
          }, 250)
        }, 250)
      })
    })

    describe("Italic", () => {
      it("Applies italic styles if allowed", done => {
        const component = getWrapper(props)
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())

        setTimeout(() => {
          instance.toggleInlineStyle("ITALIC")
          expect(component.state().html).toBe("<p><i>A piece of text</i></p>")
          setTimeout(() => {
            expect(instance.props.onChange).toHaveBeenCalled()
            done()
          }, 250)
        }, 250)
      })

      it("Does not apply italic styles if not allowed", done => {
        props.allowedStyles = ["b"]
        const component = getWrapper(props)
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())

        setTimeout(() => {
          instance.toggleInlineStyle("ITALIC")
          expect(component.state().html).toBe("<p>A piece of text</p>")
          setTimeout(() => {
            expect(instance.props.onChange).not.toHaveBeenCalled()
            done()
          }, 250)
        }, 250)
      })

      it("Can remove existing italic styles", done => {
        props.html = "<p><i>A piece of text</i></p>"
        const component = getWrapper(props)
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())

        setTimeout(() => {
          instance.toggleInlineStyle("ITALIC")
          expect(component.state().html).toBe("<p>A piece of text</p>")
          setTimeout(() => {
            expect(instance.props.onChange).toHaveBeenCalled()
            done()
          }, 250)
        }, 250)
      })
    })
  })

  describe("#handlePastedText", () => {
    it("Can paste plain text", () => {
      const component = getWrapper(props)
      const instance = component.instance() as Paragraph
      instance.handlePastedText("Some pasted text...")

      expect(component.state().html).toBe(
        "<p>Some pasted text...A piece of text</p>"
      )
    })

    it("Can paste html", () => {
      const component = getWrapper(props)
      const instance = component.instance() as Paragraph
      instance.handlePastedText("", "<p>Some pasted text...</p>")

      expect(component.state().html).toBe(
        "<p>Some pasted text...A piece of text</p>"
      )
    })

    it("Removes disallowed blocks from pasted content", () => {
      const component = getWrapper(props)
      const instance = component.instance() as Paragraph
      instance.handlePastedText("", htmlWithRichBlocks)

      expect(component.state().html).toBe(
        "<p>a link</p><p>an h1</p><p>an h2</p><p>an h3</p><p>an h4</p><p>an h5</p><p>an h6</p><p>unordered list</p><p>second list item</p><p>ordered list</p><p>a blockquoteA piece of text</p>"
      )
    })

    it("Removes disallowed styles from pasted content", () => {
      const component = getWrapper(props)
      const instance = component.instance() as Paragraph
      instance.handlePastedText("", htmlWithDisallowedStyles)

      expect(component.state().html).toBe(
        "<p>Strikethrough text Underline text <i>Italic text</i> <i>Italic text</i> <b>Bold text</b> <b>Bold text</b>A piece of text</p>"
      )
    })

    it("Strips linebreaks from pasted content", () => {
      props.stripLinebreaks = true
      const component = getWrapper(props)
      const instance = component.instance() as Paragraph
      instance.handlePastedText("", htmlWithRichBlocks)

      expect(component.state().html).toBe(
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
        const component = getWrapper(props)
        const instance = component.instance() as Paragraph
        instance.checkSelection()

        expect(component.state().editorPosition).toEqual({
          bottom: 0,
          height: 0,
          left: 0,
          right: 0,
          top: 0,
          width: 0,
        })
      })

      it("Shows nav if has selection", () => {
        const component = getWrapper(props)
        const instance = component.instance() as Paragraph
        instance.checkSelection()

        expect(component.state().showNav).toBe(true)
      })
    })

    describe("No selection", () => {
      beforeEach(() => {
        window.getSelection = jest.fn().mockReturnValue({
          isCollapsed: true,
        })
      })

      it("Resets editorPosition to null if no selection", () => {
        const component = getWrapper(props)
        const instance = component.instance() as Paragraph
        component.setState({ editorPosition: { top: 50, left: 100 } })
        instance.checkSelection()

        expect(component.state().editorPosition).toBe(null)
      })

      it("Hides nav if no selection", () => {
        const component = getWrapper(props)
        const instance = component.instance() as Paragraph
        component.setState({
          showNav: true,
          editorPosition: { top: 50, left: 100 },
        })
        instance.checkSelection()

        expect(component.state().showNav).toBe(false)
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
        const component = getWrapper(props)
        const instance = component.instance() as Paragraph
        instance.promptForLink()

        expect(component.state().editorPosition).toEqual({
          bottom: 0,
          height: 0,
          left: 0,
          right: 0,
          top: 0,
          width: 0,
        })
      })

      it("Sets urlValue with data", done => {
        props.html = '<p><a href="https://artsy.net">A link</a></p>'
        const component = getWrapper(props)
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())

        setTimeout(() => {
          instance.promptForLink()
          expect(component.state().urlValue).toBe("https://artsy.net/")
          done()
        }, 250)
      })

      it("Sets urlValue without data", done => {
        const component = getWrapper(props)
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())

        setTimeout(() => {
          instance.promptForLink()
          expect(component.state().urlValue).toBe("")
          done()
        }, 250)
      })

      it("Hides nav", done => {
        const component = getWrapper(props)
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())
        instance.checkSelection()
        expect(component.state().showNav).toBe(true)

        setTimeout(() => {
          instance.promptForLink()
          expect(component.state().showNav).toBe(false)
          done()
        }, 250)
      })

      it("Shows url input", done => {
        const component = getWrapper(props)
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())

        setTimeout(() => {
          instance.promptForLink()
          expect(component.state().showUrlInput).toBe(true)
          done()
        }, 250)
      })
    })

    describe("#confirmLink", () => {
      it("Sets editorPosition to null", done => {
        const component = getWrapper(props)
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())

        setTimeout(() => {
          instance.confirmLink("https://artsy.net/articles")
          expect(component.state().editorPosition).toBe(null)
          done()
        }, 250)
      })

      it("Sets urlValue to empty string", done => {
        const component = getWrapper(props)
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())

        setTimeout(() => {
          instance.confirmLink("https://artsy.net/articles")
          expect(component.state().urlValue).toBe("")
          done()
        }, 250)
      })

      it("Hides nav and url input", done => {
        const component = getWrapper(props)
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())

        setTimeout(() => {
          instance.confirmLink("https://artsy.net/articles")
          expect(component.state().showNav).toBe(false)
          expect(component.state().showUrlInput).toBe(false)
          done()
        }, 250)
      })

      it("Adds a link to selected text", done => {
        const component = getWrapper(props)
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())

        setTimeout(() => {
          instance.confirmLink("https://artsy.net/articles")
          expect(component.state().html).toBe(
            '<p><a href="https://artsy.net/articles">A piece of text</a></p>'
          )
          done()
        }, 250)
      })
    })

    describe("#removeLink", () => {
      beforeEach(() => {
        props.html = '<p><a href="https://artsy.net">A link</a></p>'
      })

      it("Removes a link from selected entity", done => {
        const component = getWrapper(props)
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())

        setTimeout(() => {
          instance.removeLink()
          expect(component.state().html).toBe("<p>A link</p>")
          done()
        }, 250)
      })

      it("Hides url input", done => {
        const component = getWrapper(props)
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())

        setTimeout(() => {
          instance.removeLink()
          expect(component.state().showUrlInput).toBe(false)
          done()
        }, 250)
      })

      it("Sets urlValue to empty string", done => {
        const component = getWrapper(props)
        const instance = component.instance() as Paragraph
        instance.onChange(getSelection())

        setTimeout(() => {
          instance.removeLink()
          expect(component.state().urlValue).toBe("")
          done()
        }, 250)
      })
    })
  })
})
