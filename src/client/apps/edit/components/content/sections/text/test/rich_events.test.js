import React from "react"
import { mount } from "enzyme"
import { EditorState } from "draft-js"
import { SectionText } from "../index.jsx"

describe("SectionText: Rich Events", () => {
  let props
  let getSelection

  const getWrapper = props => {
    return mount(<SectionText {...props} />)
  }

  beforeEach(() => {
    props = {
      article: { layout: "feature" },
      index: 2,
      onChangeSectionAction: jest.fn(),
      onSetEditing: jest.fn(),
      newSectionAction: jest.fn(),
      section: { body: "<p>A short piece of text</p>" },
      sections: [],
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

    window.getSelection = jest.fn().mockReturnValue({
      isCollapsed: false,
      getRangeAt,
    })
    global.getSelection = jest.fn().mockReturnValue({
      anchorNode: {},
      anchorOffset: 4,
      baseNode: {},
      baseOffset: 4,
      extentNode: {},
      extentOffset: 12,
      focusNode: {},
      focusOffset: 12,
      isCollapsed: false,
      rangeCount: 1,
      type: "Range",
      getRangeAt,
    })

    // Set up editor with text selection
    getSelection = getLast => {
      const component = getWrapper(props)
      const startSelection = component.state().editorState.getSelection()
      const startEditorState = component.state().editorState.getCurrentContent()
      const { key, text } = getLast
        ? startEditorState.getLastBlock()
        : startEditorState.getFirstBlock()
      const selection = startSelection.merge({
        anchorKey: key,
        anchorOffset: 0,
        focusKey: key,
        focusOffset: text.length,
      })
      const editorState = EditorState.acceptSelection(
        component.state().editorState,
        selection
      )
      return editorState
    }
  })

  describe("TextNav", () => {
    it("Can create italic entities", () => {
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.find(".SectionText__input").simulate("mouseUp")
      component.find(".italic").simulate("mouseDown")

      expect(component.state().html).toBe(
        "<p><em>A short piece of text</em></p>"
      )
    })

    it("Can create bold entities", () => {
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.find(".SectionText__input").simulate("mouseUp")
      component.find(".bold").simulate("mouseDown")

      expect(component.state().html).toBe(
        "<p><strong>A short piece of text</strong></p>"
      )
    })

    it("Can create strikethrough entities", () => {
      props.article.layout = "standard"
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.find(".SectionText__input").simulate("mouseUp")
      component.find(".strikethrough").simulate("mouseDown")

      expect(component.state().html).toBe(
        '<p><span style="text-decoration:line-through">A short piece of text</span></p>'
      )
    })

    it("Can create h1 blocks (feature)", () => {
      props.article.layout = "feature"
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.find(".SectionText__input").simulate("mouseUp")
      component.find(".header-one").simulate("mouseDown")

      expect(component.state().html).toBe("<h1>A short piece of text</h1>")
    })

    it("Can create h2 blocks", () => {
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.find(".SectionText__input").simulate("mouseUp")
      component.find(".header-two").simulate("mouseDown")

      expect(component.state().html).toBe("<h2>A short piece of text</h2>")
    })

    it("Can create h3 blocks", () => {
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.find(".SectionText__input").simulate("mouseUp")
      component.find(".header-three").simulate("mouseDown")

      expect(component.state().html).toBe("<h3>A short piece of text</h3>")
    })

    it("Can create h3 blocks without stripping styles (standard/feature)", () => {
      props.section.body = "<p><em>A short piece of text</em></p>"
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.find(".SectionText__input").simulate("mouseUp")
      component.find(".header-three").simulate("mouseDown")

      expect(component.state().html).toBe(
        "<h3><em>A short piece of text</em></h3>"
      )
    })

    it("Strips styles from h3 blocks in classic articles", () => {
      props.section.body = "<p><em>A short piece of text</em></p>"
      props.article.layout = "classic"
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.find(".SectionText__input").simulate("mouseUp")
      component.find(".header-three").simulate("mouseDown")

      expect(component.state().html).toBe("<h3>A short piece of text</h3>")
    })

    it("Can create UL blocks", () => {
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.find(".SectionText__input").simulate("mouseUp")
      component.find(".unordered-list-item").simulate("mouseDown")

      expect(component.state().html).toBe(
        "<ul><li>A short piece of text</li></ul>"
      )
    })

    it("Can create OL blocks", () => {
      props.article.layout = "classic"
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.find(".SectionText__input").simulate("mouseUp")
      component.find(".ordered-list-item").simulate("mouseDown")

      expect(component.state().html).toBe(
        "<ol><li>A short piece of text</li></ol>"
      )
    })

    it("Can create blockquote blocks", () => {
      props.hasFeatures = true
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.find(".SectionText__input").simulate("mouseUp")
      component.find(".blockquote").simulate("mouseDown")

      expect(component.state().html).toBe(
        "<blockquote>A short piece of text</blockquote>"
      )
    })

    it("Can make plain text", () => {
      props.section.body = "<h3><em>A short piece of text</em></h3>"
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.find(".SectionText__input").simulate("mouseUp")
      component.find(".clear-formatting").simulate("mouseDown")

      expect(component.state().html).toBe("<p>A short piece of text</p>")
    })
  })

  describe("#handleKeyCommand", () => {
    it("Can create bold entities", () => {
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.instance().handleKeyCommand("bold")

      expect(component.state().html).toBe(
        "<p><strong>A short piece of text</strong></p>"
      )
    })

    it("Can create italic entities", () => {
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.instance().handleKeyCommand("italic")

      expect(component.state().html).toBe(
        "<p><em>A short piece of text</em></p>"
      )
    })

    it("Can create strikethrough entities", () => {
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.instance().handleKeyCommand("strikethrough")

      expect(component.state().html).toBe(
        '<p><span style="text-decoration:line-through">A short piece of text</span></p>'
      )
    })

    it("Can create h1 blocks (feature)", () => {
      props.article.layout = "feature"
      props.hasFeatures = true
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.instance().handleKeyCommand("header-one")

      expect(component.state().html).toBe("<h1>A short piece of text</h1>")
    })

    it("Cannot create h1 blocks if classic article", () => {
      props.hasFeatures = true
      props.article.layout = "standard"
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.instance().handleKeyCommand("header-one")

      expect(component.state().html).toBe("<p>A short piece of text</p>")
    })

    it("Cannot create h1 blocks if classic article", () => {
      props.hasFeatures = true
      props.article.layout = "classic"
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.instance().handleKeyCommand("header-one")

      expect(component.state().html).toBe("<p>A short piece of text</p>")
    })

    it("Can create h2 blocks (feature)", () => {
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.instance().handleKeyCommand("header-two")

      expect(component.state().html).toBe("<h2>A short piece of text</h2>")
    })

    it("Can create h3 blocks (feature)", () => {
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.instance().handleKeyCommand("header-three")

      expect(component.state().html).toBe("<h3>A short piece of text</h3>")
    })

    it("Can create UL blocks (feature)", () => {
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.instance().handleKeyCommand("unordered-list-item")

      expect(component.state().html).toBe(
        "<ul><li>A short piece of text</li></ul>"
      )
    })

    it("Can create OL blocks (feature)", () => {
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.instance().handleKeyCommand("ordered-list-item")

      expect(component.state().html).toBe(
        "<ol><li>A short piece of text</li></ol>"
      )
    })

    it("Can create blockquote blocks", () => {
      props.hasFeatures = true
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.instance().handleKeyCommand("blockquote")

      expect(component.state().html).toBe(
        "<blockquote>A short piece of text</blockquote>"
      )
    })

    it("Cannot create blockquotes if props.hasFeatures is false", () => {
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.instance().handleKeyCommand("blockquote")

      expect(component.state().html).toBe("<p>A short piece of text</p>")
    })

    it("Can make plain text", () => {
      props.section.body = "<h3><em>A short piece of text</em></h3>"
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.instance().handleKeyCommand("custom-clear")

      expect(component.state().html).toBe("<p>A short piece of text</p>")
    })
  })
})
