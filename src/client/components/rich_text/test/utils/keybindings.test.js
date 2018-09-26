import {
  keyBindingFnParagraph,
  keyBindingFnFull,
} from "../../utils/keybindings"
const Draft = require("draft-js")

describe("Draft Utils: Keybindings", () => {
  describe("#keyBindingFnParagraph", () => {
    let e

    beforeEach(() => {
      Draft.getDefaultKeyBinding = jest.fn()
      Draft.KeyBindingUtil.hasCommandModifier = jest.fn()
    })

    it("Returns the name of a recognized key binding if command modifier", () => {
      Draft.KeyBindingUtil.hasCommandModifier.mockReturnValueOnce(true)
      e = { keyCode: 75 }
      expect(keyBindingFnParagraph(e)).toBe("link-prompt")
      expect(Draft.getDefaultKeyBinding.mock.calls.length).toBe(0)
    })

    it("Returns the default key binding if command modifier and not link", () => {
      Draft.KeyBindingUtil.hasCommandModifier.mockReturnValueOnce(false)
      e = { keyCode: 73 }
      keyBindingFnParagraph(e)
      expect(Draft.getDefaultKeyBinding.mock.calls.length).toBe(1)
    })

    it("Returns the default key binding if no command modifier", () => {
      Draft.KeyBindingUtil.hasCommandModifier.mockReturnValueOnce(false)
      e = { keyCode: 75 }
      keyBindingFnParagraph(e)
      expect(Draft.getDefaultKeyBinding.mock.calls.length).toBe(1)
    })

    it("Returns the default binding if no setting specified", () => {
      Draft.KeyBindingUtil.hasCommandModifier.mockReturnValueOnce(true)
      e = { keyCode: 45 }
      keyBindingFnParagraph(e)
      expect(Draft.getDefaultKeyBinding.mock.calls.length).toBe(1)
    })
  })

  describe("#keyBindingFnFull", () => {
    let e
    beforeEach(() => {
      Draft.KeyBindingUtil.hasCommandModifier = jest.fn().mockReturnValue(true)
      Draft.getDefaultKeyBinding = jest.fn()
    })

    it("Returns the name of a recognized key binding", () => {
      e = { keyCode: 49 }
      expect(keyBindingFnFull(e)).toBe("header-one")

      e.keyCode = 50
      expect(keyBindingFnFull(e)).toBe("header-two")

      e.keyCode = 51
      expect(keyBindingFnFull(e)).toBe("header-three")

      e.keyCode = 191
      expect(keyBindingFnFull(e)).toBe("custom-clear")

      e.keyCode = 55
      expect(keyBindingFnFull(e)).toBe("ordered-list-item")

      e.keyCode = 56
      expect(keyBindingFnFull(e)).toBe("unordered-list-item")

      e.keyCode = 75
      expect(keyBindingFnFull(e)).toBe("link-prompt")

      e.keyCode = 219
      expect(keyBindingFnFull(e)).toBe("blockquote")

      e.keyCode = 88
      e.shiftKey = true
      expect(keyBindingFnFull(e)).toBe("strikethrough")
      expect(Draft.getDefaultKeyBinding.mock.calls.length).toBe(0)
    })

    it("Returns the default key binding if no command modifier", () => {
      Draft.KeyBindingUtil.hasCommandModifier = jest.fn().mockReturnValue(false)
      e = { keyCode: 75 }
      keyBindingFnFull(e)
      expect(Draft.getDefaultKeyBinding.mock.calls.length).toBe(1)
    })

    it("Returns the default binding if no setting specified", () => {
      e = { keyCode: 45 }
      keyBindingFnFull(e)
      expect(Draft.getDefaultKeyBinding.mock.calls.length).toBe(1)
    })
  })
})
