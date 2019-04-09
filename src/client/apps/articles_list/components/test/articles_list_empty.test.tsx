import { mount } from "enzyme"
import React from "react"
import { ArticlesListEmpty } from "../articles_list_empty"

describe("ArticlesListEmpty", () => {
  let props

  beforeEach(() => {
    props = {
      channel: { name: "Artsy Editorial" },
      onChangeTabs: jest.fn(),
      isPublished: true,
    }
  })

  it("renders expected content", () => {
    const component = mount(<ArticlesListEmpty {...props} />)
    expect(component.text()).toBe(
      "You haven’t written any articles yet.Artsy Writer is a tool for writing stories about art on Artsy.Get started by writing an article or reaching out to your liaison for help.Write An Article"
    )
  })
})
