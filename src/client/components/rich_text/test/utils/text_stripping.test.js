import Draft from "draft-js"
import {
  makePlainText,
  removeDisallowedBlocks,
  replaceUnicodeSpaces,
  standardizeSpacing,
  stripBlockquote,
  stripGoogleStyles,
  stripH3Tags,
} from "../../utils/text_stripping"
import { decorators } from "../../utils/config"
import {
  convertFromRichHtml,
  convertToRichHtml,
} from "../../utils/convert_html"

describe("Draft Utils: Text Stripping", () => {
  describe("#standardizeSpacing", () => {
    it("Removes freestanding linebreaks", () => {
      const html = standardizeSpacing("<br><p><br></p><p></p><br>")
      expect(html).toBe("<p><br></p>")
    })

    it("Removes empty spans", () => {
      const html = standardizeSpacing("<span></span>")
      expect(html).toBe("")
    })

    it("Replaces consecutive empty paragraphs with one", () => {
      const html = standardizeSpacing("<p></p><p></p>")
      expect(html).toBe("<p><br></p>")
    })

    it("Converts empty headers into empty paragraphs", () => {
      const h2 = standardizeSpacing("<h2></h2>")
      const h3 = standardizeSpacing("<h3></h3>")
      const html = standardizeSpacing("<h2></h2><h3></h3>")

      expect(h2).toBe("<p><br></p>")
      expect(h3).toBe("<p><br></p>")
      expect(html).toBe("<p><br></p>")
    })

    it("Turns consecutive spaces to one", () => {
      const html = standardizeSpacing("<p>  </p>")
      expect(html).toBe("<p> </p>")
    })
  })

  describe("#replaceUnicodeSpaces", () => {
    it("Replaces unicode linebreaks with and empty paragraph", () => {
      const html = replaceUnicodeSpaces("<p>\u2028hello\u2029</p>")
      expect(html).toBe("<p></p><p>hello</p><p></p>")
    })
  })

  describe("#stripH3Tags", () => {
    it("Removes nested html inside h3 blocks", () => {
      const html = stripH3Tags(
        "<h3>A <em>short</em> piece of <strong>text</strong></h3>"
      )
      expect(html).toBe("<h3>A short piece of text</h3>")
    })
  })

  describe("#stripGoogleStyles", () => {
    let googleHtmlShort
    let googleHtmlLong

    beforeEach(() => {
      googleHtmlShort =
        '<p>hello</p><br><p>here again.</p><br class="Apple-interchange-newline">'
      googleHtmlLong =
        '<b style="font-weight:normal;" id="docs-internal-guid-ce2bb19a-cddb-9e53-cb18-18e71847df4e"><p><span style="font-size:11pt;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">Available at: Espacio Valverde • Galleries Sector, Booth 9F01</span></p>'
    })

    it("Removes non-breaking spaces between paragraphs", () => {
      expect(stripGoogleStyles(googleHtmlShort)).toBe(
        "<p>hello</p><p>here again.</p>"
      )
    })

    it("Removes dummy b tags google wraps the document in", () => {
      expect(stripGoogleStyles(googleHtmlLong)).toBe(
        '<p><span style="font-size:11pt;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">Available at: Espacio Valverde • Galleries Sector, Booth 9F01</span></p>'
      )
    })

    it("Replaces bold spans with <strong> tags", () => {
      googleHtmlLong = googleHtmlLong.replace("400", "700")
      expect(stripGoogleStyles(googleHtmlLong)).toBe(
        "<p><span><strong>Available at: Espacio Valverde • Galleries Sector, Booth 9F01</strong></span></p>"
      )
    })

    it("Can replace unicode spaces", () => {
      const html = stripGoogleStyles("<p>\u2028hello</p>")
      expect(html).toBe("<p><br></p><p>hello</p>")
    })

    it("Replaces italic spans with <em> tags", () => {
      googleHtmlLong = googleHtmlLong.replace(
        "font-style:normal",
        "font-style:italic"
      )
      expect(stripGoogleStyles(googleHtmlLong)).toBe(
        "<p><span><em>Available at: Espacio Valverde • Galleries Sector, Booth 9F01</em></span></p>"
      )
    })

    it("Replaces spans that are bold and italic", () => {
      googleHtmlLong = googleHtmlLong
        .replace("font-style:normal", "font-style:italic")
        .replace("font-weight:400", "font-weight:700")
      expect(stripGoogleStyles(googleHtmlLong)).toBe(
        "<p><span><strong><em>Available at: Espacio Valverde • Galleries Sector, Booth 9F01</em></strong></span></p>"
      )
    })
  })

  it("#removeDisallowedBlocks converts disallowed html elements to paragraphs", () => {
    const html = "<p>Hi.</p><blockquote>Hello.</blockquote><h1>Sup.</h1>"
    const allowedBlocks = [
      "header-two",
      "header-three",
      "unordered-list-item",
      "ordered-list-item",
      "unstyled",
    ]
    const blocksFromHTML = convertFromRichHtml(html)

    const editorState = Draft.EditorState.createWithContent(
      blocksFromHTML,
      new Draft.CompositeDecorator(decorators(true))
    )
    const cleanedState = removeDisallowedBlocks(
      editorState,
      blocksFromHTML.getBlocksAsArray(),
      allowedBlocks
    )
    const stateAsHtml = convertToRichHtml(cleanedState, "classic")

    expect(stateAsHtml).toBe("<p>Hi.</p><p>Hello.</p><p>Sup.</p>")
  })

  it("#makePlainText strips styles and links from text", () => {
    const html =
      '<p><a href="link.com">Hello</a> <strong>there</strong>.</p><h2><em>Sup.</em></h2>'
    const blocksFromHTML = convertFromRichHtml(html)
    const editorState = Draft.EditorState.createWithContent(
      blocksFromHTML,
      new Draft.CompositeDecorator(decorators(true))
    )
    const getSelection = editorState => {
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

    const stateWithSelection = getSelection(editorState)
    const cleanedState = makePlainText(stateWithSelection)
    const stateAsHtml = convertToRichHtml(cleanedState, "classic")
    expect(stateAsHtml).toBe("<p>Hello there.</p><h2>Sup.</h2>")
  })

  it("#stripBlockquote replaces blockquotes with paragraphs", () => {
    const html = "<blockquote>hello.</blockquote>"
    const stripped = stripBlockquote(html)

    expect(stripped).toBe("<p>hello.</p>")
  })
})
