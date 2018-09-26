import React from "react"
import { clone } from "lodash"
import { mount } from "enzyme"
import { EditorState } from "draft-js"
import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { TextInputUrl } from "client/components/rich_text/components/input_url"
import { SectionText } from "../index.jsx"

describe("SectionText: Links", () => {
  let props
  let article
  let getSelection

  const getWrapper = props => {
    return mount(<SectionText {...props} />)
  }

  beforeEach(() => {
    article = clone(StandardArticle)
    props = {
      article,
      index: 2,
      onChangeSectionAction: jest.fn(),
      onSetEditing: jest.fn(),
      section: article.sections[11],
      sections: article.sections,
    }
    window.scrollTo = jest.fn()
    window.pageYOffset = 500
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

  it("Opens a link input popup from the menu", () => {
    props.sectionIndex = props.index
    const component = getWrapper(props)
    component.instance().onChange(getSelection())
    component.find(".SectionText__input").simulate("mouseUp")
    component.find(".link").simulate("mouseDown")

    expect(component.state().showUrlInput).toBe(true)
    expect(component.find(TextInputUrl).exists()).toBe(true)
  })

  it("Opens a link input popup via key command", () => {
    props.sectionIndex = props.index
    const component = getWrapper(props)
    component.instance().onChange(getSelection())
    component.find(".SectionText__input").simulate("mouseUp")
    component.instance().handleKeyCommand("link-prompt")

    expect(component.state().showUrlInput).toBe(true)
    expect(component.html()).toMatch('placeholder="Paste or type a link"')
  })

  it("Can confirm links", () => {
    const component = getWrapper(props)
    component.instance().onChange(getSelection())

    component.instance().confirmLink("link.com")
    expect(component.state().html).toMatch('<a href="link.com">')
    expect(component.html()).toMatch('<a href="link.com">')
  })

  it("Can handle special characters inside links correctly", () => {
    props.section.body = '<a href="http://artsy.net">Hauser & Wirth</a>'
    const component = getWrapper(props)

    expect(component.state().html).toMatch("Hauser &amp; Wirth")
    expect(component.html()).toMatch("Hauser &amp; Wirth")
    expect(component.text()).toMatch("Hauser & Wirth")
  })

  describe("Artist follow plugin", () => {
    it("Renders an artist menu item if hasFeatures is true", () => {
      props.hasFeatures = true
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.find(".SectionText__input").simulate("mouseUp")

      expect(component.find(".artist").exists()).toBe(true)
    })

    it("Does not show artist if hasFeatures is false", () => {
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.find(".SectionText__input").simulate("mouseUp")

      expect(component.find(".artist").exists()).toBe(false)
    })

    it("Can setup link prompt for artist blocks", () => {
      props.hasFeatures = true
      const component = getWrapper(props)
      component.instance().onChange(getSelection())
      component.find(".SectionText__input").simulate("mouseUp")
      component.find(".artist").simulate("mouseDown")

      expect(component.state().showUrlInput).toBe(true)
      expect(component.state().plugin).toBe("artist")
    })

    it("Adds data-id to artist links", () => {
      props.hasFeatures = true
      props.section.body =
        '<p><a href="https://www.artsy.net/artist/erin-shirreff" class="is-follow-link">Erin Shirreff</a> is an artist.</p>'
      const component = getWrapper(props)
      component.instance().onChange(component.state().editorState)

      expect(component.state().html).toMatch(
        '<a data-id="erin-shirreff" class="entity-follow artist-follow"></a>'
      )
    })
  })
})
