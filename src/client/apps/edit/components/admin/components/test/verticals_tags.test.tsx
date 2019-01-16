import { Button } from "@artsy/palette"
import { FeatureArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { IconRemove } from "@artsy/reaction/dist/Components/Publishing/Icon/IconRemove"
import Backbone from "backbone"
import {
  AutocompleteInlineList,
  ListItem,
} from "client/components/autocomplete2/inline_list"
import { mount } from "enzyme"
import { cloneDeep } from "lodash"
import React from "react"
import { AdminVerticalsTags } from "../verticals_tags"
require("typeahead.js")

describe("AdminVerticalsTags", () => {
  let props

  const getWrapper = (passedProps = props) => {
    return mount(<AdminVerticalsTags {...passedProps} />)
  }

  beforeEach(() => {
    props = {
      article: cloneDeep(FeatureArticle),
      onChangeArticleAction: jest.fn(),
    }

    Backbone.Collection.prototype.fetch = jest.fn(res => {
      const verticals = new Backbone.Collection([
        { id: "123", name: "Art" },
        { id: "456", name: "News" },
        props.article.vertical,
      ])
      return res.success(verticals)
    })
  })

  describe("Verticals", () => {
    beforeEach(() => {
      delete props.article.tags
      delete props.article.tracking_tags
    })

    it("Renders buttons for verticals", () => {
      const component = getWrapper()

      expect(component.find(Button).length).toBe(3)
      expect(component.text()).toMatch(props.article.vertical.name)
    })

    it("Knows which vertical is active", () => {
      const component = getWrapper()
      const activeButton = component.find(Button).at(1)

      expect(activeButton.text()).toMatch(
        component.props().article.vertical.name
      )
      expect(activeButton.props().variant).toBe("primaryBlack")
    })

    it("Can change the vertical on click", () => {
      const component = getWrapper()
      const button = component.find(Button).last()
      button.simulate("click")

      expect(props.onChangeArticleAction.mock.calls[0][0]).toBe("vertical")
      expect(props.onChangeArticleAction.mock.calls[0][1].name).toBe("News")
    })

    it("Unsets vertical when clicking active vertical", () => {
      const component = getWrapper()
      const button = component.find(Button).at(1)
      button.simulate("click")

      expect(props.onChangeArticleAction.mock.calls[0][0]).toBe("vertical")
      expect(props.onChangeArticleAction.mock.calls[0][1]).toBe(null)
    })

    it("#maybeSetupNews sets a news article vertical to News if no vertical present", () => {
      props.article.layout = "news"
      props.article.vertical = null
      getWrapper(props)

      expect(props.onChangeArticleAction.mock.calls[0][0]).toBe("vertical")
      expect(props.onChangeArticleAction.mock.calls[0][1].name).toBe("News")
    })
  })

  describe("Topic Tags", () => {
    it("Renders inputs for topic tags", () => {
      const component = getWrapper()
      const input = component.find(AutocompleteInlineList).first()

      expect(input.props().placeholder).toMatch("Start typing a topic tag...")
      expect(input.props().items).toBe(props.article.tags)
    })

    it("Renders a list of saved topic tags", () => {
      const component = getWrapper()
      expect(
        component
          .find(ListItem)
          .at(0)
          .text()
      ).toMatch(props.article.tags[0])
    })

    it("Can remove a saved topic tag", () => {
      const component = getWrapper()
      component
        .find(IconRemove)
        .at(0)
        .simulate("click")

      expect(props.onChangeArticleAction.mock.calls[0][0]).toBe("tags")
      expect(props.onChangeArticleAction.mock.calls[0][1].length).toBe(0)
    })
  })

  describe("Tracking Tags", () => {
    it("Renders inputs for tracking tags", () => {
      const component = getWrapper()
      const input = component.find(AutocompleteInlineList).last()

      expect(input.props().placeholder).toMatch(
        "Start typing a tracking tag..."
      )
      expect(input.props().items).toBe(props.article.tracking_tags)
    })

    it("Renders a list of saved tracking tags", () => {
      const component = getWrapper()
      expect(
        component
          .find(ListItem)
          .at(1)
          .text()
      ).toMatch(props.article.tracking_tags[0])
    })

    it("Can remove a saved tracking tag", () => {
      const component = getWrapper()
      component
        .find(IconRemove)
        .at(1)
        .simulate("click")

      expect(props.onChangeArticleAction.mock.calls[0][0]).toBe("tracking_tags")
      expect(props.onChangeArticleAction.mock.calls[0][1].length).toBe(0)
    })
  })
})
