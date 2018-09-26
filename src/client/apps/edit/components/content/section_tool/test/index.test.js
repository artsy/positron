import React from "react"
import { clone } from "lodash"
import { mount } from "enzyme"
import { FeatureArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { IconEditEmbed } from "@artsy/reaction/dist/Components/Publishing/Icon/IconEditEmbed"
import { IconEditImages } from "@artsy/reaction/dist/Components/Publishing/Icon/IconEditImages"
import { IconEditText } from "@artsy/reaction/dist/Components/Publishing/Icon/IconEditText"
import { IconEditVideo } from "@artsy/reaction/dist/Components/Publishing/Icon/IconEditVideo"
import { IconHeroImage } from "@artsy/reaction/dist/Components/Publishing/Icon/IconHeroImage"
import { IconHeroVideo } from "@artsy/reaction/dist/Components/Publishing/Icon/IconHeroVideo"
import { SectionTool } from "../index"

describe("SectionTool", () => {
  let props
  let sections

  const getWrapper = props => {
    return mount(<SectionTool {...props} />)
  }

  describe("In SectionList", () => {
    beforeEach(() => {
      sections = clone(FeatureArticle.sections)

      props = {
        article: {
          layout: "standard",
        },
        channel: {
          type: "editorial",
        },
        isPartnerChannel: false,
        isEditing: false,
        index: sections.length - 1,
        isHero: false,
        newSectionAction: jest.fn(),
        section: null,
        sections,
      }
    })

    it("opens on click", () => {
      const component = getWrapper(props)
      component.find(".edit-tool__icon").simulate("click")

      expect(component.state().open).toBe(true)
    })

    it("renders the section icons when open", () => {
      const component = getWrapper(props)
      component.find(".edit-tool__icon").simulate("click")

      expect(component.find(IconEditText).exists()).toBe(true)
      expect(component.find(IconEditImages).exists()).toBe(true)
      expect(component.find(IconEditVideo).exists()).toBe(true)
      expect(component.find(IconEditEmbed).exists()).toBe(true)
    })

    it("Adds a data-visible prop to the last section tool", () => {
      const component = getWrapper(props)
      expect(component.html()).toMatch('data-visible="true"')
    })

    it("Adds a data-visible prop to the first section tool if no sections", () => {
      props.firstSection = true
      props.sections = []
      const component = getWrapper(props)

      expect(component.html()).toMatch('data-visible="true"')
    })

    describe("Section options", () => {
      it("Renders correct icons for Classic layout with internal channel features", () => {
        props.article.layout = "classic"
        const component = getWrapper(props)
        component.find(".edit-tool__icon").simulate("click")

        expect(component.find(IconEditText).exists()).toBe(true)
        expect(component.find(IconEditImages).exists()).toBe(true)
        expect(component.find(IconEditVideo).exists()).toBe(true)
        expect(component.find(IconEditEmbed).exists()).toBe(true)
      })

      it("Renders correct icons for Classic layout in partner channel", () => {
        props.article.layout = "classic"
        props.isPartnerChannel = true
        const component = getWrapper(props)
        component.find(".edit-tool__icon").simulate("click")

        expect(component.find(IconEditText).exists()).toBe(true)
        expect(component.find(IconEditImages).exists()).toBe(true)
        expect(component.find(IconEditVideo).exists()).toBe(true)
        expect(component.find(IconEditEmbed).exists()).toBe(false)
      })

      it("Renders correct icons for Standard layout", () => {
        props.article.layout = "standard"
        const component = getWrapper(props)
        component.find(".edit-tool__icon").simulate("click")

        expect(component.find(IconEditText).exists()).toBe(true)
        expect(component.find(IconEditImages).exists()).toBe(true)
        expect(component.find(IconEditVideo).exists()).toBe(true)
        expect(component.find(IconEditEmbed).exists()).toBe(true)
      })

      it("Renders correct icons for Feature layout", () => {
        props.article.layout = "feature"
        const component = getWrapper(props)
        component.find(".edit-tool__icon").simulate("click")

        expect(component.find(IconEditText).exists()).toBe(true)
        expect(component.find(IconEditImages).exists()).toBe(true)
        expect(component.find(IconEditVideo).exists()).toBe(true)
        expect(component.find(IconEditEmbed).exists()).toBe(true)
      })

      it("Renders correct icons for News layout", () => {
        props.article.layout = "news"
        const component = getWrapper(props)
        component.find(".edit-tool__icon").simulate("click")

        expect(component.find(IconEditText).exists()).toBe(true)
        expect(component.find(IconEditImages).exists()).toBe(true)
        expect(component.find(IconEditVideo).exists()).toBe(false)
        expect(component.find(IconEditEmbed).exists()).toBe(true)
      })

      it("Renders correct icons for first tool in News layout", () => {
        props.article.layout = "news"
        props.firstSection = true
        const component = getWrapper(props)
        component.find(".edit-tool__icon").simulate("click")

        expect(component.find(IconEditText).exists()).toBe(true)
        expect(component.find(IconEditImages).exists()).toBe(true)
        expect(component.find(IconEditVideo).exists()).toBe(false)
        expect(component.find(IconEditEmbed).exists()).toBe(false)
      })
    })

    describe("Section creation", () => {
      it("Can create a text section", () => {
        const expectedIndex = props.sections.length
        const component = getWrapper(props)
        component.find(".edit-tool__icon").simulate("click")
        component.find(IconEditText).simulate("click")

        expect(props.newSectionAction.mock.calls[0][0]).toBe("text")
        expect(props.newSectionAction.mock.calls[0][1]).toBe(expectedIndex)
      })

      it("Can create an image section", () => {
        const expectedIndex = props.sections.length
        const component = getWrapper(props)
        component.find(".edit-tool__icon").simulate("click")
        component.find(IconEditImages).simulate("click")

        expect(props.newSectionAction.mock.calls[0][0]).toBe("image_collection")
        expect(props.newSectionAction.mock.calls[0][1]).toBe(expectedIndex)
      })

      it("Can create a video section", () => {
        const expectedIndex = props.sections.length
        const component = getWrapper(props)
        component.find(".edit-tool__icon").simulate("click")
        component.find(IconEditVideo).simulate("click")

        expect(props.newSectionAction.mock.calls[0][0]).toBe("video")
        expect(props.newSectionAction.mock.calls[0][1]).toBe(expectedIndex)
      })

      it("Can create an embed section", () => {
        const expectedIndex = props.sections.length
        const component = getWrapper(props)
        component.find(".edit-tool__icon").simulate("click")
        component.find(IconEditEmbed).simulate("click")

        expect(props.newSectionAction.mock.calls[0][0]).toBe("embed")
        expect(props.newSectionAction.mock.calls[0][1]).toBe(expectedIndex)
      })

      it("Can create a social embed section", () => {
        props.article.layout = "news"
        const expectedIndex = props.sections.length
        const component = getWrapper(props)
        component.find(".edit-tool__icon").simulate("click")
        component.find(IconEditEmbed).simulate("click")

        expect(props.newSectionAction.mock.calls[0][0]).toBe("social_embed")
        expect(props.newSectionAction.mock.calls[0][1]).toBe(expectedIndex)
      })
    })
  })

  describe("In Hero Section", () => {
    beforeEach(() => {
      props = {
        isEditing: false,
        isHero: true,
        index: -1,
        newHeroSectionAction: jest.fn(),
        onSetEditing: jest.fn(),
        section: {},
        sections: clone(FeatureArticle.sections),
      }
    })

    it("opens on click", () => {
      const component = getWrapper(props)
      component.find(".edit-tool__icon").simulate("click")

      expect(component.state().open).toBe(true)
    })

    it("renders the section icons when open", () => {
      const component = getWrapper(props)
      component.find(".edit-tool__icon").simulate("click")

      expect(component.find(IconHeroImage).exists()).toBe(true)
      expect(component.find(IconHeroVideo).exists()).toBe(true)
    })

    describe("Section creation", () => {
      it("Can create an image section", () => {
        const component = getWrapper(props)
        component.find(".edit-tool__icon").simulate("click")
        component.find(IconHeroImage).simulate("click")

        expect(props.newHeroSectionAction.mock.calls[0][0]).toBe(
          "image_collection"
        )
        expect(props.onSetEditing.mock.calls[0][0]).toBe(true)
      })

      it("Can create a video section", () => {
        const component = getWrapper(props)
        component.find(".edit-tool__icon").simulate("click")
        component.find(IconHeroVideo).simulate("click")

        expect(props.newHeroSectionAction.mock.calls[0][0]).toBe("video")
        expect(props.onSetEditing.mock.calls[0][0]).toBe(true)
      })
    })
  })
})
