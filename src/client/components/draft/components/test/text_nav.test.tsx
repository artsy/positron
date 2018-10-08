import { IconArtist } from "@artsy/reaction/dist/Components/Publishing/Icon/IconArtist"
import { IconBlockquote } from "@artsy/reaction/dist/Components/Publishing/Icon/IconBlockquote"
import { IconClearFormatting } from "@artsy/reaction/dist/Components/Publishing/Icon/IconClearFormatting"
import { IconLink } from "@artsy/reaction/dist/Components/Publishing/Icon/IconLink"
import { IconOrderedList } from "@artsy/reaction/dist/Components/Publishing/Icon/IconOrderedList"
import { IconUnorderedList } from "@artsy/reaction/dist/Components/Publishing/Icon/IconUnorderedList"
import { mount } from "enzyme"
import Immutable from "immutable"
import { extend } from "lodash"
import React from "react"
import { blockRenderMap } from "../../../../apps/edit/components/content/sections/text/draft_config"
import { BackgroundOverlay } from "../background_overlay"
import { Button, TextNav } from "../text_nav"

jest.mock("draft-js", () => ({
  getVisibleSelectionRect: jest.fn().mockReturnValue({
    bottom: 170,
    height: 25,
    left: 425,
    right: 525,
    top: 145,
    width: 95,
  }),
}))

describe("TextNav", () => {
  const getWrapper = passedProps => {
    return mount(<TextNav {...passedProps} />)
  }

  let props
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

  beforeEach(() => {
    props = {
      editorPosition: {
        top: 120,
        left: 200,
      },
      onClickOff: jest.fn(),
      toggleBlock: jest.fn(),
      toggleStyle: jest.fn(),
    }
  })

  describe("Rendering", () => {
    it("renders no buttons by default", () => {
      const component = getWrapper(props)
      expect(component.find(Button).length).toBe(0)
    })

    it("renders link button if props.promptForLink", () => {
      props.promptForLink = jest.fn()
      const component = getWrapper(props)
      expect(component.find(Button).length).toBe(1)
      expect(component.find(IconLink).length).toBe(1)
    })

    it("renders plain-text button if props.togglePlainText", () => {
      props.togglePlainText = jest.fn()
      const component = getWrapper(props)
      expect(component.find(Button).length).toBe(1)
      expect(component.find(IconClearFormatting).length).toBe(1)
    })

    it("renders artist button if props.hasFeatures and props.promptForLink", () => {
      props.hasFollowButton = true
      props.promptForLink = jest.fn()
      const component = getWrapper(props)
      expect(component.find(Button).length).toBe(2)
      expect(component.find(IconArtist).length).toBe(1)
    })

    it("renders italic button if allowed", () => {
      props.allowedStyles = [{ name: "ITALIC", element: "I" }]
      const component = getWrapper(props)
      expect(component.find(Button).text()).toBe("I")
      expect(component.find(Button).length).toBe(1)
    })

    it("renders bold button if allowed", () => {
      props.allowedStyles = [{ name: "BOLD", element: "B" }]
      const component = getWrapper(props)
      expect(component.find(Button).text()).toBe("B")
      expect(component.find(Button).length).toBe(1)
    })

    it("renders h1 button if allowed", () => {
      props.allowedBlocks = Immutable.Map({
        "header-one": {},
      })
      const component = getWrapper(props)
      expect(component.find(Button).text()).toBe("h1")
      expect(component.find(Button).length).toBe(1)
    })

    it("renders h2 button if allowed", () => {
      props.allowedBlocks = Immutable.Map({
        "header-two": {},
      })
      const component = getWrapper(props)
      expect(component.find(Button).text()).toBe("h2")
      expect(component.find(Button).length).toBe(1)
    })

    it("renders h3 button if allowed", () => {
      props.allowedBlocks = Immutable.Map({
        "header-three": {},
      })
      const component = getWrapper(props)
      expect(component.find(Button).text()).toBe("h3")
      expect(component.find(Button).length).toBe(1)
    })

    it("renders blockquote button if allowed", () => {
      props.allowedBlocks = Immutable.Map({
        blockquote: {},
      })
      const component = getWrapper(props)
      expect(component.find(IconBlockquote).length).toBe(1)
      expect(component.find(Button).length).toBe(1)
    })

    it("renders OL button if allowed", () => {
      props.allowedBlocks = Immutable.Map({
        "ordered-list-item": {},
      })
      const component = getWrapper(props)
      expect(component.find(IconOrderedList).length).toBe(1)
      expect(component.find(Button).length).toBe(1)
    })

    it("renders UL button if allowed", () => {
      props.allowedBlocks = Immutable.Map({
        "unordered-list-item": {},
      })
      const component = getWrapper(props)
      expect(component.find(IconUnorderedList).length).toBe(1)
      expect(component.find(Button).length).toBe(1)
    })
  })

  describe("#stickyControlsBox", () => {
    it("Calculates position based on selection and props.editorPosition", () => {
      props = extend(props, {
        allowedStyles: [{ name: "BOLD", element: "B" }],
      })
      const component = getWrapper(props).instance() as TextNav
      const controlsPosition = component.stickyControlsBox()

      expect(controlsPosition.top).toBe(-15)
      expect(controlsPosition.left).toBe(247.5)
    })

    it("Adjust position based on menu size", () => {
      props = extend(props, {
        editorPosition: {
          top: 120,
          left: 200,
        },
        allowedStyles: [{ name: "BOLD", element: "B" }],
        hasFollowButton: true,
        promptForLink: jest.fn(),
      })
      const component = getWrapper(props).instance() as TextNav
      const controlsPosition = component.stickyControlsBox()

      expect(controlsPosition.top).toBe(-15)
      expect(controlsPosition.left).toBe(197.5)
    })
  })

  describe("#getNavDimensions", () => {
    it("Wraps menu if more than 5 buttons", () => {
      props = extend(props, {
        allowedBlocks: blockRenderMap("feature", true),
        allowedStyles: [
          { name: "ITALIC", element: "I" },
          { name: "BOLD", element: "B" },
        ],
        promptForLink: jest.fn(),
        toggleBlock: jest.fn(),
        togglePlainText: jest.fn(),
        toggleStyle: jest.fn(),
      })
      const component = getWrapper(props).instance() as TextNav
      const navDimensions = component.getNavDimensions()

      expect(navDimensions.height).toBe(80)
      expect(navDimensions.width).toBe(250)
    })

    it("Sets the width to 50px per button and inline height if less than 5 buttons", () => {
      props = extend(props, {
        allowedStyles: [
          { name: "ITALIC", element: "I" },
          { name: "BOLD", element: "B" },
        ],
        promptForLink: jest.fn(),
        toggleStyle: jest.fn(),
      })
      const component = getWrapper(props).instance() as TextNav
      const navDimensions = component.getNavDimensions()

      expect(navDimensions.height).toBe(40)
      expect(navDimensions.width).toBe(150)
    })
  })

  describe("Actions", () => {
    beforeEach(() => {
      props = {
        allowedBlocks: blockRenderMap("feature", true),
        allowedStyles: [
          { name: "ITALIC", element: "I" },
          { name: "BOLD", element: "B" },
        ],
        hasFollowButton: true,
        onClickOff: jest.fn(),
        promptForLink: jest.fn(),
        toggleBlock: jest.fn(),
        togglePlainText: jest.fn(),
        toggleStyle: jest.fn(),
      }
    })

    it("Can toggle styles on click", () => {
      const component = getWrapper(props)
      component
        .find(Button)
        .at(0)
        .simulate("mouseDown")
      expect(props.toggleStyle).toBeCalledWith("ITALIC")
    })

    it("Can toggle blocks on click", () => {
      const component = getWrapper(props)
      component
        .find(Button)
        .at(2)
        .simulate("mouseDown")
      expect(props.toggleBlock).toBeCalledWith("header-one")
    })

    it("Can toggle a link prompt on link click", () => {
      const component = getWrapper(props)
      component
        .find(Button)
        .at(8)
        .simulate("mouseDown")
      expect(props.promptForLink).toHaveBeenCalled()
    })

    it("Can toggle a link prompt with plugin args on artist click", () => {
      const component = getWrapper(props)
      component
        .find(Button)
        .at(9)
        .simulate("mouseDown")
      expect(props.promptForLink).toBeCalledWith(true)
    })

    it("Can toggle makePlainText", () => {
      const component = getWrapper(props)
      component
        .find(Button)
        .at(10)
        .simulate("mouseDown")
      expect(props.togglePlainText).toHaveBeenCalled()
    })

    it("Calls props.onClickOff on background click", () => {
      const component = getWrapper(props)
      component
        .find(BackgroundOverlay)
        .at(0)
        .simulate("click")
      expect(props.onClickOff).toBeCalled()
    })
  })
})
