import { getContentState } from "client/components/draft/shared/test_helpers"
import { getHtmlViaContentState } from "client/components/draft/shared/test_helpers"
import { blockMapFromNodes } from "../utils"

describe("#convertHtmlToDraft", () => {
  describe("Links", () => {
    it("Converts links to entities if allowed", () => {
      const html = '<p><a href="https://artsy.net">a link</a></p>'
      const contentState = getContentState(html, true)
      const block = contentState.getFirstBlock()
      const hasLinks = jest.fn()

      block.findEntityRanges(character => {
        const entityKey = character.getEntity()
        return (
          entityKey !== null &&
          contentState.getEntity(entityKey).getType() === "LINK"
        )
      }, hasLinks)

      expect(hasLinks).toBeCalled()
      expect(block.getType()).toBe("unstyled")
      expect(block.getText()).toBe("a link")
    })

    it("Converts artist follow links to entities if allowed", () => {
      const html = `
        <span>
          <a href="https://www.artsy.net/artist/claes-oldenburg" class="is-follow-link">
            Claes Oldenburg
          </a>
          <a data-id="claes-oldenburg" class="entity-follow artist-follow" />
        </span>
      `
      const contentState = getContentState(html, true)
      const block = contentState.getFirstBlock()
      const hasLinks = jest.fn()

      block.findEntityRanges(character => {
        const entityKey = character.getEntity()
        return (
          entityKey !== null &&
          contentState.getEntity(entityKey).getType() === "LINK"
        )
      }, hasLinks)

      expect(hasLinks).toBeCalled()
      expect(block.getType()).toBe("unstyled")
      expect(block.getText()).toMatch("Claes Oldenburg")
    })

    it("Returns links as plaintext if not allowed", () => {
      const html = '<p><a href="https://artsy.net">a link</a></p>'
      const contentState = getContentState(html, false)
      const block = contentState.getFirstBlock()
      const hasLinks = jest.fn()

      block.findEntityRanges(character => {
        const entityKey = character.getEntity()
        return (
          entityKey !== null &&
          contentState.getEntity(entityKey).getType() === "LINK"
        )
      }, hasLinks)

      expect(hasLinks).not.toBeCalled()
      expect(block.getType()).toBe("unstyled")
      expect(block.getText()).toBe("a link")
    })
  })

  describe("Style handling", () => {
    it("Preserves italic styles", () => {
      const html = "<p><em>italic</em></p>"
      const contentState = getContentState(html, false)
      const block = contentState.getFirstBlock()
      const hasStyle = jest.fn()

      block.findStyleRanges(character => {
        return character.hasStyle("ITALIC")
      }, hasStyle)
      expect(hasStyle).toBeCalled()
      expect(block.getType()).toBe("unstyled")
      expect(block.getText()).toBe("italic")
    })

    it("Preserves bold styles", () => {
      const html = "<p><strong>bold</strong></p>"
      const contentState = getContentState(html, false)
      const block = contentState.getFirstBlock()
      const hasStyle = jest.fn()

      block.findStyleRanges(character => {
        return character.hasStyle("BOLD")
      }, hasStyle)
      expect(hasStyle).toBeCalled()
      expect(block.getType()).toBe("unstyled")
      expect(block.getText()).toBe("bold")
    })

    it("Preserves strikethrough styles", () => {
      const html = "<p><s>strikethrough</s></p>"
      const contentState = getContentState(html, false)
      const block = contentState.getFirstBlock()
      const hasStyle = jest.fn()

      block.findStyleRanges(character => {
        return character.hasStyle("STRIKETHROUGH")
      }, hasStyle)
      expect(hasStyle).toBeCalled()
      expect(block.getType()).toBe("unstyled")
      expect(block.getText()).toBe("strikethrough")
    })

    it("Preserves underline styles", () => {
      const html = "<p><u>underline</u></p>"
      const contentState = getContentState(html, false)
      const block = contentState.getFirstBlock()
      const hasStyle = jest.fn()

      block.findStyleRanges(character => {
        return character.hasStyle("UNDERLINE")
      }, hasStyle)
      expect(hasStyle).toBeCalled()
      expect(block.getType()).toBe("unstyled")
      expect(block.getText()).toBe("underline")
    })

    describe("Disallowed style handling", () => {
      it("Removes code styles", () => {
        const html = "<p><code>code</code></p>"
        const contentState = getContentState(html, false)
        const block = contentState.getFirstBlock()
        const hasStyle = jest.fn()

        block.findStyleRanges(character => {
          return character.hasStyle("CODE")
        }, hasStyle)
        expect(hasStyle).not.toBeCalled()
        expect(block.getType()).toBe("unstyled")
        expect(block.getText()).toBe("code")
      })
    })
  })

  describe("Block handling", () => {
    it("Returns unstyled paragraphs", () => {
      const html = "<p>a paragraph</p>"
      const contentState = getContentState(html, false)
      const block = contentState.getFirstBlock()

      expect(block.getType()).toBe("unstyled")
      expect(block.getText()).toBe("a paragraph")
    })

    it("Converts h2 blocks", () => {
      const html = "<h2>an h2</h2>"
      const contentState = getContentState(html, false)
      const block = contentState.getFirstBlock()

      expect(block.getType()).toBe("header-two")
      expect(block.getText()).toBe("an h2")
    })

    it("Converts h3 blocks", () => {
      const html = "<h3>an h3</h3>"
      const contentState = getContentState(html, false)
      const block = contentState.getFirstBlock()

      expect(block.getType()).toBe("header-three")
      expect(block.getText()).toBe("an h3")
    })

    it("Converts blockquote blocks", () => {
      const html = "<blockquote>a blockquote</blockquote>"
      const contentState = getContentState(html, false)
      const block = contentState.getFirstBlock()

      expect(block.getType()).toBe("blockquote")
      expect(block.getText()).toBe("a blockquote")
    })

    it("Converts ul blocks", () => {
      const html = `
        <ul>
        <li>first list item</li>
        <li>second list item</li>
        </ul>
      `
      const contentState = getContentState(html, false)
      const firstBlock = contentState.getFirstBlock()
      const secondBlock = contentState.getLastBlock()

      expect(firstBlock.getType()).toBe("unordered-list-item")
      expect(firstBlock.getText()).toBe("first list item")
      expect(secondBlock.getType()).toBe("unordered-list-item")
      expect(secondBlock.getText()).toBe("second list item")
    })

    it("Converts ol blocks", () => {
      const html = `
        <ol>
        <li>first list item</li>
        <li>second list item</li>
        </ol>
      `
      const contentState = getContentState(html, false)
      const firstBlock = contentState.getFirstBlock()
      const secondBlock = contentState.getLastBlock()

      expect(firstBlock.getType()).toBe("ordered-list-item")
      expect(firstBlock.getText()).toBe("first list item")
      expect(secondBlock.getType()).toBe("ordered-list-item")
      expect(secondBlock.getText()).toBe("second list item")
    })

    it("Converts h1 blocks if allowed", () => {
      const html = "<h1>an h1</h1>"
      const allowedBlocks = blockMapFromNodes(["h1"])
      const contentState = getContentState(html, false, allowedBlocks)
      const block = contentState.getFirstBlock()

      expect(block.getType()).toBe("header-one")
      expect(block.getText()).toBe("an h1")
    })

    describe("Disallowed blocks", () => {
      it("Converts h1 blocks", () => {
        const html = "<h1>an h1</h1>"
        const contentState = getContentState(html, false)
        const block = contentState.getFirstBlock()

        expect(block.getType()).toBe("unstyled")
        expect(block.getText()).toBe("an h1")
      })

      it("Converts h4 blocks", () => {
        const html = "<h4>an h4</h4>"
        const contentState = getContentState(html, false)
        const block = contentState.getFirstBlock()

        expect(block.getType()).toBe("unstyled")
        expect(block.getText()).toBe("an h4")
      })

      it("Converts h5 blocks", () => {
        const html = "<h5>an h5</h5>"
        const contentState = getContentState(html, false)
        const block = contentState.getFirstBlock()

        expect(block.getType()).toBe("unstyled")
        expect(block.getText()).toBe("an h5")
      })

      it("Converts h6 blocks", () => {
        const html = "<h6>an h6</h6>"
        const contentState = getContentState(html, false)
        const block = contentState.getFirstBlock()

        expect(block.getType()).toBe("unstyled")
        expect(block.getText()).toBe("an h6")
      })

      it("Converts div blocks", () => {
        const html = "<div>a div</div>"
        const contentState = getContentState(html, false)
        const block = contentState.getFirstBlock()

        expect(block.getType()).toBe("unstyled")
        expect(block.getText()).toBe("a div")
      })

      it("Converts table blocks", () => {
        const html = "<tr><th>table header</th><td>table cell</td></tr>"
        const contentState = getContentState(html, false)
        const block = contentState.getFirstBlock()

        expect(block.getType()).toBe("unstyled")
        expect(block.getText()).toBe("table headertable cell")
      })

      it("Removes body blocks", () => {
        const html = "<body><p>a nested paragraph</p></body>"
        const contentState = getContentState(html, false)
        const block = contentState.getFirstBlock()

        expect(block.getType()).toBe("unstyled")
        expect(block.getText()).toBe("a nested paragraph")
      })

      it("Removes meta tags", () => {
        const html = "<meta><title>Page Title</title></meta><p>a paragraph</p>"
        const contentState = getContentState(html, false)
        const block = contentState.getFirstBlock()

        expect(block.getType()).toBe("unstyled")
        expect(block.getText()).toBe("a paragraph")
      })

      it("Removes script tags", () => {
        const html = "<script>do a bad thing</script><p>a paragraph</p>"
        const contentState = getContentState(html, false)
        const block = contentState.getFirstBlock()

        expect(block.getType()).toBe("unstyled")
        expect(block.getText()).toBe("a paragraph")
      })

      it("Removes empty paragraphs", () => {
        const html = "<p>a paragraph</p><p></p><p><br></p><p><br /></p>"
        const newHtml = getHtmlViaContentState(html)

        expect(newHtml).toBe("<p>a paragraph</p>")
      })
    })
  })
})

describe("#convertDraftToHtml", () => {
  describe("Links", () => {
    it("Converts entities to links if allowed", () => {
      const html =
        '<p><a href="https://artsy.net" target="_blank">a link</a></p>'
      const convertedHtml = getHtmlViaContentState(html, true)

      expect(convertedHtml).toBe(
        '<p><a href="https://artsy.net/">a link</a></p>'
      )
    })

    it("Converts artist-follow entities to links if allowed", () => {
      const html = `
        <span><a href="https://www.artsy.net/artist/claes-oldenburg" class="is-follow-link">Claes Oldenburg</a><a data-id="claes-oldenburg" class="entity-follow artist-follow" /></span>`
      const convertedHtml = getHtmlViaContentState(html, true, true)

      expect(convertedHtml).toBe(
        '<p><span><a href="https://www.artsy.net/artist/claes-oldenburg" class="is-follow-link">Claes Oldenburg</a><a data-id="claes-oldenburg" class="entity-follow artist-follow"></a></span></p>'
      )
    })

    it("Strips links to plaintext if not allowed", () => {
      const html =
        '<p><a href="https://artsy.net" target="_blank">a link</a></p>'
      const convertedHtml = getHtmlViaContentState(html)

      expect(convertedHtml).toBe("<p>a link</p>")
    })

    it("Strips artist follow links to plaintext if not allowed", () => {
      const html = `
        <span><a href="https://www.artsy.net/artist/claes-oldenburg" class="is-follow-link">Claes Oldenburg</a><a data-id="claes-oldenburg" class="entity-follow artist-follow" /></span>`
      const convertedHtml = getHtmlViaContentState(html)

      expect(convertedHtml).toBe("<p>Claes Oldenburg</p>")
    })
  })

  describe("Style handling", () => {
    it("Preserves italic styles", () => {
      const html = "<p><em>italic</em></p>"
      const convertedHtml = getHtmlViaContentState(html)

      expect(convertedHtml).toBe("<p><i>italic</i></p>")
    })

    it("Preserves bold styles", () => {
      const html = "<p><strong>bold</strong></p>"
      const convertedHtml = getHtmlViaContentState(html)

      expect(convertedHtml).toBe("<p><b>bold</b></p>")
    })

    it("Preserves strikethrough styles", () => {
      const html = "<p><s>strikethrough</s></p>"
      const convertedHtml = getHtmlViaContentState(html)

      expect(convertedHtml).toBe("<p><s>strikethrough</s></p>")
    })

    it("Preserves underline styles", () => {
      const html = "<p><u>underline</u></p>"
      const convertedHtml = getHtmlViaContentState(html)

      expect(convertedHtml).toBe("<p><u>underline</u></p>")
    })

    describe("Disallowed style handling", () => {
      it("Removes code styles", () => {
        const html = "<p><code>code</code></p>"
        const convertedHtml = getHtmlViaContentState(html)

        expect(convertedHtml).toBe("<p>code</p>")
      })
    })
  })

  describe("Block handling", () => {
    it("Returns unstyled paragraphs with stripped attrs", () => {
      const html =
        '<p id="paragraph" class="paragraph" data-id="paragraph">a paragraph</p>'
      const convertedHtml = getHtmlViaContentState(html)

      expect(convertedHtml).toBe("<p>a paragraph</p>")
    })

    it("Converts h2 blocks", () => {
      const html = "<h2>header two</h2>"
      const convertedHtml = getHtmlViaContentState(html)

      expect(convertedHtml).toBe("<h2>header two</h2>")
    })

    it("Converts h3 blocks", () => {
      const html = "<h3>header three</h3>"
      const convertedHtml = getHtmlViaContentState(html)

      expect(convertedHtml).toBe("<h3>header three</h3>")
    })

    it("Converts blockquote blocks", () => {
      const html = "<blockquote>a blockquote</blockquote>"
      const convertedHtml = getHtmlViaContentState(html)

      expect(convertedHtml).toBe("<blockquote>a blockquote</blockquote>")
    })

    it("Converts ul blocks", () => {
      const html = `
        <ul>
        <li>first list item</li>
        <li>second list item</li>
        </ul>
      `
      const convertedHtml = getHtmlViaContentState(html)

      expect(convertedHtml).toBe(
        "<ul><li>first list item</li><li>second list item</li></ul>"
      )
    })

    it("Converts ol blocks", () => {
      const html = `
        <ol>
        <li>first list item</li>
        <li>second list item</li>
        </ol>
      `
      const convertedHtml = getHtmlViaContentState(html)

      expect(convertedHtml).toBe(
        "<ol><li>first list item</li><li>second list item</li></ol>"
      )
    })

    describe("Disallowed blocks", () => {
      it("Converts h1 blocks", () => {
        const html = "<h1>an h1</h1>"
        const convertedHtml = getHtmlViaContentState(html)

        expect(convertedHtml).toBe("<p>an h1</p>")
      })

      it("Converts h4 blocks", () => {
        const html = "<h4>an h4</h4>"
        const convertedHtml = getHtmlViaContentState(html)

        expect(convertedHtml).toBe("<p>an h4</p>")
      })

      it("Converts h5 blocks", () => {
        const html = "<h5>an h5</h5>"
        const convertedHtml = getHtmlViaContentState(html)

        expect(convertedHtml).toBe("<p>an h5</p>")
      })

      it("Converts h6 blocks", () => {
        const html = "<h6>an h6</h6>"
        const convertedHtml = getHtmlViaContentState(html)

        expect(convertedHtml).toBe("<p>an h6</p>")
      })

      it("Converts div blocks", () => {
        const html = "<div>a div</div>"
        const convertedHtml = getHtmlViaContentState(html)

        expect(convertedHtml).toBe("<p>a div</p>")
      })

      it("Converts table blocks", () => {
        const html = "<tr><th>table header</th><td>table cell</td></tr>"
        const convertedHtml = getHtmlViaContentState(html)

        expect(convertedHtml).toBe("<p>table headertable cell</p>")
      })

      it("Removes body blocks", () => {
        const html = "<body><p>a nested paragraph</p></body>"
        const convertedHtml = getHtmlViaContentState(html)

        expect(convertedHtml).toBe("<p>a nested paragraph</p>")
      })

      it("Removes meta tags", () => {
        const html = "<meta><title>Page Title</title></meta><p>a paragraph</p>"
        const convertedHtml = getHtmlViaContentState(html)

        expect(convertedHtml).toBe("<p>a paragraph</p>")
      })

      it("Removes script tags", () => {
        const html = "<script>do a bad thing</script><p>a paragraph</p>"
        const convertedHtml = getHtmlViaContentState(html)

        expect(convertedHtml).toBe("<p>a paragraph</p>")
      })
    })
  })
})
