import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { RichText } from "client/components/draft/rich_text/rich_text"
import { getEditorState } from "client/components/draft/shared/test_helpers"
import { EditorState, SelectionState } from "draft-js"
import { mount } from "enzyme"
import { cloneDeep } from "lodash"
import React from "react"
import { SectionText2 } from "../index2"

describe("SectionText", () => {
  let props
  let article

  const getWrapper = (passedProps = props) => {
    return mount(<SectionText2 {...passedProps} />)
  }

  beforeEach(() => {
    article = cloneDeep(StandardArticle)

    props = {
      article,
      index: 2,
      onChangeSectionAction: jest.fn(),
      maybeMergeTextSectionsAction: jest.fn(),
      onSetEditing: jest.fn(),
      onSplitTextSectionAction: jest.fn(),
      removeSectionAction: jest.fn(),
      setSectionAction: jest.fn(),
      section: cloneDeep(article.sections[11]),
      sections: article.sections,
    }
  })

  it("Renders RichText component", () => {
    const component = getWrapper()
    expect(component.find(RichText).length).toBe(1)
  })

  describe("#getAllowedBlocks", () => {
    it("Returns correct blocks for feature", () => {
      props.article.layout = "feature"
      const instance = getWrapper().instance() as SectionText2
      const blocks = instance.getAllowedBlocks()

      expect(blocks).toEqual(["h1", "h2", "h3", "blockquote", "ol", "ul", "p"])
    })

    it("Returns correct blocks for standard", () => {
      const instance = getWrapper().instance() as SectionText2
      const blocks = instance.getAllowedBlocks()

      expect(blocks).toEqual(["h2", "h3", "blockquote", "ol", "ul", "p"])
    })

    it("Returns correct blocks for news", () => {
      props.article.layout = "news"
      const instance = getWrapper().instance() as SectionText2
      const blocks = instance.getAllowedBlocks()

      expect(blocks).toEqual(["h3", "blockquote", "ol", "ul", "p"])
    })

    it("Returns correct blocks for classic", () => {
      props.article.layout = "classic"
      const instance = getWrapper().instance() as SectionText2
      const blocks = instance.getAllowedBlocks()

      expect(blocks).toEqual(["h2", "h3", "blockquote", "ul", "ol", "p"])
    })
  })

  describe("#onHandleReturn", () => {
    it("calls #onSplitTextSectionAction if section should be split", () => {
      const instance = getWrapper().instance() as SectionText2
      instance.divideEditorState = jest.fn().mockReturnValue({
        beforeHtml: "<p>First block</p>",
        afterHtml: "<p>Second block</p>",
      })
      instance.onHandleReturn(EditorState.createEmpty())

      expect(props.onSplitTextSectionAction).toBeCalledWith(
        "<p>First block</p>",
        "<p>Second block</p>"
      )
    })

    it("does nothing if section should not be split", () => {
      const instance = getWrapper().instance() as SectionText2
      instance.divideEditorState = jest.fn()
      instance.onHandleReturn(EditorState.createEmpty())

      expect(props.onSplitTextSectionAction).not.toBeCalled()
    })
  })

  describe("#onHandleTab", () => {
    it("calls #setSectionAction for next section", () => {
      const instance = getWrapper().instance() as SectionText2
      instance.onHandleTab({})

      expect(props.setSectionAction).toBeCalledWith(3)
    })

    it("calls #setSectionAction for previous section if shift key", () => {
      const instance = getWrapper().instance() as SectionText2
      instance.onHandleTab({ shiftKey: true })

      expect(props.setSectionAction).toBeCalledWith(1)
    })
  })

  describe("#onHandleBackspace", () => {
    it("calls #maybeMergeTextSectionsAction if section is not first", () => {
      const instance = getWrapper().instance() as SectionText2
      instance.onHandleBackspace()

      expect(props.maybeMergeTextSectionsAction).toBeCalled()
    })

    it("does nothing if section is first", () => {
      props.index = 0
      const instance = getWrapper().instance() as SectionText2
      instance.onHandleBackspace()

      expect(props.maybeMergeTextSectionsAction).not.toBeCalled()
    })
  })

  describe("#divideEditorState", () => {
    it("Returns html for two blocks if state can be divided", () => {
      const editorState = getEditorState(
        "<p>First block.</p><p>Second block.</p>"
      )
      const startSelection = editorState.getSelection()
      const startEditorState = editorState.getCurrentContent()
      // @ts-ignore
      const { key } = startEditorState.getLastBlock()
      const selection = startSelection.merge({
        anchorKey: key,
        anchorOffset: 12,
        focusKey: key,
        focusOffset: 0,
      }) as SelectionState
      const newEditorState = EditorState.acceptSelection(editorState, selection)

      const instance = getWrapper().instance() as SectionText2
      const newBlocks = instance.divideEditorState(newEditorState)

      expect(newBlocks).toEqual({
        beforeHtml: "<p>First block.</p>",
        afterHtml: "<p>Second block.</p>",
      })
    })

    it("does nothing if section should not be split", () => {
      const editorState = getEditorState(
        "<p>First block.</p><p>Second block.</p>"
      )
      const instance = getWrapper().instance() as SectionText2
      const newBlocks = instance.divideEditorState(editorState)

      expect(newBlocks).toBeUndefined()
    })
  })
})
