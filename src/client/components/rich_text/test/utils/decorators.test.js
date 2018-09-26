import { setContentEnd } from "../../utils/decorators"

describe("Draft Utils: Decorators", () => {
  describe("#setContentEnd", () => {
    it("Strips content-end from a section", () => {
      const html =
        '<p>Here is start text.</p><p>Here is end text.<span class="content-end"></span></p>'
      expect(setContentEnd(html)).toBe(
        "<p>Here is start text.</p><p>Here is end text.</p>"
      )
    })
  })
})
