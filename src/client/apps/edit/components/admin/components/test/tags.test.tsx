import { Input } from "@artsy/reaction/dist/Components/Input"
import { mount } from "enzyme"
import React from "react"
import { AdminTags } from "../tags"

describe("AdminTags", () => {
  let props

  const getWrapper = (passedProps = props) => {
    return mount(<AdminTags {...passedProps} />)
  }

  beforeEach(() => {
    props = {
      article: {
        tags: ["Cats", "Kittens"],
        tracking_tags: ["Dogs", "Puppies"],
      },
      onChangeArticleAction: jest.fn(),
    }
  })

  describe("Topic Tags", () => {
    it("Renders inputs for topic tags", () => {
      const component = getWrapper()
      const input = component.find("input").first()

      expect(input.props().placeholder).toMatch("Start typing a topic tag...")
    })

    it("Renders a list of saved topic tags", () => {
      const component = getWrapper()
      const input = component.find("input").first()

      expect(input.props().defaultValue).toMatch(props.article.tags[0])
      expect(input.props().defaultValue).toMatch(props.article.tags[1])
    })

    it("Adds new tags on input", () => {
      const component = getWrapper()
      const input = component
        .find(Input)
        .at(0)
        .props()

      const event = ({
        currentTarget: {
          value: "New York, Photography",
        },
      } as unknown) as React.FormEvent<HTMLInputElement>
      input.onChange(event)

      expect(props.onChangeArticleAction.mock.calls[0][0]).toBe("tags")
      expect(props.onChangeArticleAction.mock.calls[0][1][0]).toBe("New York")
      expect(props.onChangeArticleAction.mock.calls[0][1][1]).toBe(
        "Photography"
      )
    })
  })

  describe("Tracking Tags", () => {
    it("Renders inputs for tracking tags", () => {
      const component = getWrapper()
      const input = component.find("input").last()

      expect(input.props().placeholder).toMatch(
        "Start typing a tracking tag..."
      )
    })

    it("Renders a list of saved tracking tags", () => {
      const component = getWrapper()
      const input = component.find("input").last()

      expect(input.props().defaultValue).toMatch(props.article.tracking_tags[0])
      expect(input.props().defaultValue).toMatch(props.article.tracking_tags[1])
    })

    it("Adds new tracking tags on input", () => {
      const component = getWrapper()
      const input = component
        .find(Input)
        .at(1)
        .props()

      const event = ({
        currentTarget: {
          value: "New York, Photography",
        },
      } as unknown) as React.FormEvent<HTMLInputElement>
      input.onChange(event)

      expect(props.onChangeArticleAction.mock.calls[0][0]).toBe("tracking_tags")
      expect(props.onChangeArticleAction.mock.calls[0][1][0]).toBe("New York")
      expect(props.onChangeArticleAction.mock.calls[0][1][1]).toBe(
        "Photography"
      )
    })
  })
})
