import { decorators } from "client/components/draft/shared/decorators"
import Draft, { EditorState } from "draft-js"
import { convertDraftToHtml, convertHtmlToDraft } from "../convert"
import {
  blockMapFromNodes,
  keyBindingFn,
  makePlainText,
  removeBlocks,
  removeInlineStyles,
  removeLinks,
} from "../utils"
import { richTextBlockRenderMap, richTextStyleMap } from "../utils"

describe("RichText utils", () => {
  const e: React.KeyboardEvent<{}> = {} as React.KeyboardEvent<{}>
  const getContentState = (
    html,
    hasLinks = true,
    blockMap = richTextBlockRenderMap
  ) => {
    return convertHtmlToDraft(html, hasLinks, blockMap, richTextStyleMap)
  }

  const getEditorState = (
    html,
    hasLinks = true,
    blockMap = richTextBlockRenderMap
  ) => {
    const contentState = getContentState(html, hasLinks, blockMap)
    return EditorState.createWithContent(contentState, decorators(hasLinks))
  }

  const getStateAsHtml = editorState => {
    return convertDraftToHtml(
      editorState.getCurrentContent(),
      richTextBlockRenderMap,
      richTextStyleMap
    )
  }

  const applySelectionToEditorState = editorState => {
    const startSelection = editorState.getSelection()
    const startEditorState = editorState.getCurrentContent()
    const { key, text } = startEditorState.getFirstBlock()
    const selection = startSelection.merge({
      anchorKey: key,
      anchorOffset: 0,
      focusKey: key,
      focusOffset: text.length,
    })
    const newEditorState = Draft.EditorState.acceptSelection(
      editorState,
      selection
    )
    return newEditorState
  }

  describe("#blockMapFromNodes", () => {
    it("Constructs an immutable map from blocktype args", () => {
      const blockmap = blockMapFromNodes(["h1", "p"])
      const keys = Array.from(blockmap.keys())
      expect(keys[0]).toBe("header-one")
      expect(keys[1]).toBe("unstyled")
    })

    it("Can handle all rich-text block types ", () => {
      const blockmap = blockMapFromNodes([
        "h1",
        "h2",
        "h3",
        "ol",
        "ul",
        "blockquote",
        "p",
      ])
      const keys = Array.from(blockmap.keys())
      expect(keys[0]).toBe("header-one")
      expect(keys[1]).toBe("header-two")
      expect(keys[2]).toBe("header-three")
      expect(keys[3]).toBe("ordered-list-item")
      expect(keys[4]).toBe("unordered-list-item")
      expect(keys[5]).toBe("blockquote")
      expect(keys[6]).toBe("unstyled")
    })
  })

  describe("#keyBindingFn", () => {
    beforeEach(() => {
      Draft.KeyBindingUtil.hasCommandModifier = jest.fn().mockReturnValue(true)
    })

    it("Can handle header-one", () => {
      e.key = "1"
      e.keyCode = 49
      expect(keyBindingFn(e)).toBe("header-one")
    })

    it("Can handle header-two", () => {
      e.key = "2"
      e.keyCode = 50
      expect(keyBindingFn(e)).toBe("header-two")
    })

    it("Can handle header-three", () => {
      e.key = "3"
      e.keyCode = 51
      expect(keyBindingFn(e)).toBe("header-three")
    })

    it("Can handle plain-text", () => {
      e.key = "/"
      e.keyCode = 191
      expect(keyBindingFn(e)).toBe("plain-text")
    })

    it("Can handle ordered-list-item", () => {
      e.key = "7"
      e.keyCode = 55
      expect(keyBindingFn(e)).toBe("ordered-list-item")
    })

    it("Can handle unordered-list-item", () => {
      e.key = "8"
      e.keyCode = 56
      expect(keyBindingFn(e)).toBe("unordered-list-item")
    })

    it("Can handle link-prompt", () => {
      e.key = "K"
      e.keyCode = 75
      expect(keyBindingFn(e)).toBe("link-prompt")
    })

    it("Can handle blockquote", () => {
      e.key = "["
      e.keyCode = 219
      expect(keyBindingFn(e)).toBe("blockquote")
    })

    it("Can handle strikethrough", () => {
      e.key = "x"
      e.keyCode = 88
      e.shiftKey = true
      expect(keyBindingFn(e)).toBe("strikethrough")
    })

    it("Returns default keybinding if not supported key command", () => {
      Draft.KeyBindingUtil.hasCommandModifier = jest.fn().mockReturnValue(false)
      Draft.getDefaultKeyBinding = jest.fn()
      keyBindingFn(e)

      expect(Draft.getDefaultKeyBinding).toBeCalled()
    })
  })

  it("#makePlainText returns editorState as plaintext", () => {
    const html =
      '<h2><a href="link.com">Link</a> with <strong>bold</strong> and <em>italics.</em></h2>'
    const editorState = applySelectionToEditorState(getEditorState(html))
    const newState = makePlainText(editorState)
    const newHtml = getStateAsHtml(newState)
    expect(newHtml).toBe("<p>Link with bold and italics.</p>")
  })

  describe("#removeInlineStyles", () => {
    it("Removes B", () => {
      const html = "<p><strong>A piece</strong> of <b>bold</b> text.</p>"
      const editorState = applySelectionToEditorState(getEditorState(html))
      const newState = removeInlineStyles(editorState)
      const newHtml = getStateAsHtml(newState)
      expect(newHtml).toBe("<p>A piece of bold text.</p>")
    })

    it("Removes C", () => {
      const html = "<p><code>A piece of code text.</code></p>"
      const editorState = applySelectionToEditorState(getEditorState(html))
      const newState = removeInlineStyles(editorState)
      const newHtml = getStateAsHtml(newState)
      expect(newHtml).toBe("<p>A piece of code text.</p>")
    })

    it("Removes I", () => {
      const html = "<p><i>A piece</i> of <em>italic</em> text.</p>"
      const editorState = applySelectionToEditorState(getEditorState(html))
      const newState = removeInlineStyles(editorState)
      const newHtml = getStateAsHtml(newState)
      expect(newHtml).toBe("<p>A piece of italic text.</p>")
    })

    it("Removes U", () => {
      const html = "<p><u>A piece of underlined text.</u></p>"
      const editorState = applySelectionToEditorState(getEditorState(html))
      const newState = removeInlineStyles(editorState)
      const newHtml = getStateAsHtml(newState)
      expect(newHtml).toBe("<p>A piece of underlined text.</p>")
    })

    it("Removes S", () => {
      const html = "<p><s>A piece of strikethru text.</s></p>"
      const editorState = applySelectionToEditorState(getEditorState(html))
      const newState = removeInlineStyles(editorState)
      const newHtml = getStateAsHtml(newState)
      expect(newHtml).toBe("<p>A piece of strikethru text.</p>")
    })
  })

  describe("#removeBlocks", () => {
    it("Removes h1", () => {
      const html = "<h1>A piece of text.</h1>"
      const editorState = applySelectionToEditorState(getEditorState(html))
      const contentWithoutBlocks = removeBlocks(editorState)
      const newState = EditorState.createWithContent(
        contentWithoutBlocks,
        decorators(true)
      )
      const newHtml = getStateAsHtml(newState)
      expect(newHtml).toBe("<p>A piece of text.</p>")
    })
    it("Removes h2", () => {
      const html = "<h2>A piece of text.</h2>"
      const editorState = applySelectionToEditorState(getEditorState(html))
      const contentWithoutBlocks = removeBlocks(editorState)
      const newState = EditorState.createWithContent(
        contentWithoutBlocks,
        decorators(true)
      )
      const newHtml = getStateAsHtml(newState)
      expect(newHtml).toBe("<p>A piece of text.</p>")
    })

    it("Removes h3", () => {
      const html = "<h3>A piece of text.</h3>"
      const editorState = applySelectionToEditorState(getEditorState(html))
      const contentWithoutBlocks = removeBlocks(editorState)
      const newState = EditorState.createWithContent(
        contentWithoutBlocks,
        decorators(true)
      )
      const newHtml = getStateAsHtml(newState)
      expect(newHtml).toBe("<p>A piece of text.</p>")
    })

    it("Removes blockquote", () => {
      const html = "<blockquote>A piece of text.</blockquote>"
      const editorState = applySelectionToEditorState(getEditorState(html))
      const contentWithoutBlocks = removeBlocks(editorState)
      const newState = EditorState.createWithContent(
        contentWithoutBlocks,
        decorators(true)
      )
      const newHtml = getStateAsHtml(newState)
      expect(newHtml).toBe("<p>A piece of text.</p>")
    })

    it("Removes ol", () => {
      const html = "<ol><li>A piece of text.</li></ol>"
      const editorState = applySelectionToEditorState(getEditorState(html))
      const contentWithoutBlocks = removeBlocks(editorState)
      const newState = EditorState.createWithContent(
        contentWithoutBlocks,
        decorators(true)
      )
      const newHtml = getStateAsHtml(newState)
      expect(newHtml).toBe("<p>A piece of text.</p>")
    })

    it("Removes ul", () => {
      const html = "<ul><li>A piece of text.</li></ul>"
      const editorState = applySelectionToEditorState(getEditorState(html))
      const contentWithoutBlocks = removeBlocks(editorState)
      const newState = EditorState.createWithContent(
        contentWithoutBlocks,
        decorators(true)
      )
      const newHtml = getStateAsHtml(newState)
      expect(newHtml).toBe("<p>A piece of text.</p>")
    })
  })

  describe("#removeLinks", () => {
    it("Removes links", () => {
      const html = "<p>A <a href='link.com'>linked</a> text.</p>"
      const editorState = applySelectionToEditorState(getEditorState(html))
      const newState = removeLinks(editorState)
      const newHtml = getStateAsHtml(newState)
      expect(newHtml).toBe("<p>A linked text.</p>")
    })

    it("Removes follow links", () => {
      const html =
        "<p>A <a href='artsy.net/artist/fia-backstrom' class='is-follow-link'>linked</a> text.</p>"
      const editorState = applySelectionToEditorState(getEditorState(html))
      const newState = removeLinks(editorState)
      const newHtml = getStateAsHtml(newState)
      expect(newHtml).toBe("<p>A linked text.</p>")
    })
  })
})
