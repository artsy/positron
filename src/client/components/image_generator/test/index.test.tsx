import { mount } from "enzyme"
import gemup from "gemup"
import React from "react"
import { ImageGenerator } from ".."

jest.mock("gemup")

describe("ImageGenerator", () => {
  let props
  const onChangeArticleAction = jest.fn()
  let component
  const fillText = jest.fn()
  const fillRect = jest.fn()
  let canvas: any

  const getWrapper = _props => {
    return mount(<ImageGenerator {..._props} />, {
      attachTo: document.body,
    })
  }

  beforeEach(() => {
    const article = {
      thumbnail_title: "Some Title that can be Wrapped",
      published_at: "2018-01-01",
    }

    onChangeArticleAction.mockClear()
    props = {
      article,
      onChangeArticleAction,
    }

    window.fetch = jest.fn(() => {
      return {
        blob: jest.fn().mockReturnValue("foo.img"),
      }
    })

    component = getWrapper(props)
    canvas = document.getElementById("canvas")
    fillRect.mockClear()
    fillText.mockClear()
    let textWidth = 100
    const measureText = jest.fn(() => {
      return { width: (textWidth += 140) }
    })
    canvas.getContext = jest.fn(() => {
      return { fillStyle: "", font: "", fillRect, fillText, measureText }
    })
    canvas.toDataURL = jest.fn(() => "foo")
  })

  it("renders image generator field and canvas", () => {
    expect(component.find(ImageGenerator).exists()).toBe(true)
    expect(component.find("canvas").length).toBe(1)
    expect(component.find("textarea").length).toBe(1)
    expect(component.find("button").length).toBe(1)
  })

  it("generates new image based on text", () => {
    component.find("button").simulate("click")
    expect(canvas.getContext.mock.calls.length).toBe(1)
    expect(fillRect.mock.calls[0]).toEqual([0, 0, 1080, 470])
    expect(fillText.mock.calls[0]).toEqual(["News", 120, 62])
    expect(fillText.mock.calls[1]).toEqual(["Jan 01", 490, 62])
  })

  it("handles wrapped text", () => {
    component.find("button").simulate("click")
    expect(fillText.mock.calls.length).toBe(4)
    expect(fillText.mock.calls[2][0]).toBe("Some Title that can be ")
    expect(fillText.mock.calls[3][0]).toBe("Wrapped ")
  })

  it("uploads the image to s3 and returns a url", () => {
    component.find("button").simulate("click")
    expect(gemup.mock.calls[0][0]).toEqual("foo.img")
    gemup.mock.calls[0][1].done("artsy.net/foo.jpg")
    component.update()
    expect(props.onChangeArticleAction.mock.calls[0][0]).toBe("thumbnail_image")
  })
})
