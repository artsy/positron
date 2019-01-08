import Icon from "@artsy/reaction/dist/Components/Icon"
import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { mount } from "enzyme"
import { clone } from "lodash"
import React from "react"
import { EditHeader, HeaderButton } from "../index"

describe("Edit Header Controls", () => {
  const globalAny: any = global
  globalAny.confirm = jest.fn(() => true)

  const getWrapper = (passedProps = props) => {
    return mount(<EditHeader {...passedProps} />)
  }

  let props

  beforeEach(() => {
    props = {
      beforeUnload: jest.fn(),
      article: clone(StandardArticle),
      changeViewAction: jest.fn(),
      channel: { type: "partner" },
      deleteArticleAction: jest.fn(),
      edit: {
        isSaved: true,
        isSaving: false,
        isPublishing: false,
      },
      isAdmin: false,
      publishArticleAction: jest.fn(),
      saveArticleAction: jest.fn(),
    }
  })

  it("renders all buttons for standard user", () => {
    const component = getWrapper()

    expect(component.find("button").length).toBe(6)
  })

  it("renders admin button for admin users", () => {
    props.isAdmin = true
    const component = getWrapper()

    expect(component.find("button").length).toBe(7)
    expect(component.text()).toMatch("Admin")
  })

  it("renders auto-link button for editorial channel", () => {
    props.channel.type = "editorial"
    const component = getWrapper()

    expect(component.find("button").length).toBe(7)
    expect(component.text()).toMatch("Auto-link")
  })

  describe("Checkmarks", () => {
    it("Content indicates completion if complete", () => {
      const component = getWrapper()

      expect(
        component
          .find(Icon)
          .first()
          .props().color
      ).toBe("green100")
    })

    it("Content indicates non-completion", () => {
      delete props.article.title
      const component = getWrapper()

      expect(
        component
          .find(Icon)
          .first()
          .props().color
      ).toBe("black30")
    })

    it("Display indicates completion if complete", () => {
      props.article.thumbnail_image = "image.jpg"
      const component = getWrapper()

      expect(
        component
          .find(Icon)
          .last()
          .props().color
      ).toBe("green100")
    })

    it("Display indicates non-completion", () => {
      delete props.article.thumbnail_image
      const component = getWrapper()

      expect(
        component
          .find(Icon)
          .last()
          .props().color
      ).toBe("black30")
    })
  })

  describe("Actions", () => {
    it("Changes activeView on edit-tab click", () => {
      const component = getWrapper()
      const button = component.find("button").at(1)
      button.simulate("click")

      expect(props.changeViewAction.mock.calls[0][0]).toBe("display")
    })

    it("Publishes an article on button click", () => {
      props.article.thumbnail_image = "image.jpg"
      const component = getWrapper()
      const button = component.find("button").at(2)
      button.simulate("click")

      expect(props.publishArticleAction).toBeCalled()
    })

    it("Unpublishes an article on button click", () => {
      props.article.thumbnail_image = "image.jpg"
      props.article.published = true
      const component = getWrapper()
      const button = component.find("button").at(2)
      button.simulate("click")

      expect(props.publishArticleAction).toBeCalled()
    })

    xit("Calls auto-link on button click", () => {
      // TODO - Move auto-link into redux actions
    })

    it("Deletes an article on button click", () => {
      const component = getWrapper()
      const button = component.find("button").at(3)
      button.simulate("click")

      expect(globalAny.confirm.mock.calls.length).toBe(1)
      expect(props.deleteArticleAction.mock.calls.length).toBe(1)
    })

    it("Saves an article on button click", () => {
      const component = getWrapper()
      const button = component.find("button").at(4)
      button.simulate("click")

      expect(props.saveArticleAction.mock.calls.length).toBe(1)
    })

    it("Saves a published article on button click", () => {
      props.article.published = true
      const component = getWrapper()
      const button = component.find("button").at(4)
      button.simulate("click")

      expect(props.saveArticleAction.mock.calls.length).toBe(1)
    })

    it("Removes beforeUnload listener on click", () => {
      window.removeEventListener = jest.fn()
      props.article.published = true
      const component = getWrapper()
      const button = component.find("button").at(4)
      button.simulate("click")

      expect((window.removeEventListener as any).mock.calls[3][0]).toBe(
        "beforeunload"
      )
      expect((window.removeEventListener as any).mock.calls[3][1]).toBe(
        props.beforeUnload
      )
    })
  })

  describe("Publish button", () => {
    beforeEach(() => {
      props.article.thumbnail_image = "image.jpg"
    })

    it("Is disabled if content is not complete", () => {
      delete props.article.thumbnail_image
      const component = getWrapper()
      expect(
        component
          .find(HeaderButton)
          .at(2)
          .prop("disabled")
      ).toBe(true)
    })

    it('Renders "Publish" if unpublished', () => {
      const component = getWrapper()
      expect(component.text()).toMatch("Publish")
    })

    it('Renders "Publishing..." if publishing and isPublishing', () => {
      props.edit.isPublishing = true
      // set article published because isPublished is set after save
      const component = getWrapper()

      expect(component.text()).toMatch("Publishing...")
    })

    it('Renders "Unpublish" if published', () => {
      props.article.published = true
      const component = getWrapper()

      expect(component.text()).toMatch("Unpublish")
    })

    it('Renders "Unpublishing..." if published and isPublishing', () => {
      props.edit.isPublishing = true
      props.article.published = true
      // set article published because isPublished is set after save
      const component = getWrapper()

      expect(component.text()).toMatch("Unpublishing...")
    })
  })

  describe("Save button", () => {
    it('Renders "Save Draft" if unpublished', () => {
      const component = getWrapper()

      expect(component.text()).toMatch("Save Draft")
    })

    it('Renders "Save Article" if published', () => {
      props.article.published = true
      const component = getWrapper()

      expect(component.text()).toMatch("Save Article")
    })

    it('Renders "Saving..." if isSaving', () => {
      props.edit.isSaving = true
      const component = getWrapper()

      expect(component.text()).toMatch("Saving...")
    })

    it("Color is red unless isSaved", () => {
      props.edit.isSaved = false
      const component = getWrapper()
      const instance = component.instance() as EditHeader

      expect(instance.getSaveColor()).toBe("red100")
    })

    it("Color is green if isSaving", () => {
      props.edit.isSaving = true
      const component = getWrapper()
      const instance = component.instance() as EditHeader

      expect(instance.getSaveColor()).toBe("green100")
    })

    it("Color is black if isSaved", () => {
      props.edit.isSaved = true
      const component = getWrapper()
      const instance = component.instance() as EditHeader

      expect(instance.getSaveColor()).toBe("black100")
    })
  })

  describe("Preview button", () => {
    it('Renders "Preview" if unpublished', () => {
      const component = getWrapper()

      expect(component.html()).toMatch(props.article.slug)
      expect(component.html()).toMatch("Preview")
    })

    it('Renders "View" if published', () => {
      props.article.published = true
      const component = getWrapper()

      expect(component.html()).not.toMatch("Preview")
      expect(component.html()).toMatch("View")
    })
  })
})
