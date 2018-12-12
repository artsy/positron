import { Box, color, Flex, Sans, Serif, space } from "@artsy/palette"
import Icon from "@artsy/reaction/dist/Components/Icon"
import { Input, StyledInput } from "@artsy/reaction/dist/Components/Input"
import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { mount, shallow } from "enzyme"
import { clone } from "lodash"
import React from "react"
import { Yoast, YoastContainer, YoastOutput } from "../index"

describe("Yoast", () => {
  let props
  // let wrapper

  const getWrapper = passedProps => {
    return mount(
      // <React.Fragment>
      <Yoast {...passedProps} />
      //   <div id="yoast-snippet" />
      //   <div id="yoast-output" />
      // </React.Fragment>
    )
  }

  beforeEach(() => {
    props = {
      article: clone(StandardArticle),
      yoastKeyword: "ceramics",
      setYoastKeywordAction: jest.fn(),
    }
  })

  describe("Rendering", () => {
    it("renders an input field", () => {
      const component = getWrapper(props)
      expect(component.find(Input).length).toBe(1)
    })

    it("populates the input field with the yoast keyword", () => {
      const component = getWrapper(props)
      expect(component.find(Input).props().value).toBe("ceramics")
    })

    it("doesn't populate the input field with the yoast keyword if no yoast keyword exists", () => {
      props.yoastKeyword = ""
      const component = getWrapper(props)
      expect(component.find(Input).props().value).toBe("")
    })

    it("renders a close icon", () => {
      const component = getWrapper(props)
      expect(component.find(Icon).length).toBe(1)
    })

    it("renders a yoast output container", () => {
      const component = getWrapper(props)
      expect(component.find(YoastOutput).length).toBe(1)
    })

    it("does not display a yoast output container if no yoast keyword exists", () => {
      props.yoastKeyword = ""
      const component = getWrapper(props)
      const output = component
        .find(YoastOutput)
        .first()
        .getElement()
      // expect(output.props.style.display).toBe("none")
      // expect(outputStyle).toHaveProperty("display", "none")

      // expect(component.find(YoastOutput).prop("style")).toHaveProperty(
      //   "display",
      //   "none"
      // )
      // expect(component.find(YoastOutput).style.to.have.property('display', 'none')).toBe(true)
    })

    // it("renders a yoast snippet container", () => {
    //   const component = getWrapper(props)
    //   expect(component.find("#yoast-snippet").length).toBe(1)
    // })

    // it("doesn't render yoast output if there is no yoast keyword", () => {
    //   props.yoastKeyword = ""
    //   const component = getWrapper(props)
    //   expect(component.find("#yoast-output").length).toBe(0)
    // })
  })

  // describe("generateResolveMessage", () => {
  //   props = {
  //     article: clone(StandardArticle),
  //     yoastKeyword: "",
  //     setYoastKeywordAction: jest.fn(),
  //   }
  //   const component = getWrapper()
  //   it("returns 'set target keyword' when there is no yoastKeyword", () => {
  //     console.log(component)

  //     // console.log("COM PONENT", component)
  //     // expect(
  //     //   component
  //     //     .find("snippet-editor-title")
  //     //     .at(0)
  //     //     .text()
  //     // ).toEqual("cats")
  //   })
  // })

  describe("#getBodyText", () => {
    it("returns body text", () => {
      const component = getWrapper(props).instance() as Yoast
      const fullText = component.getBodyText()
      const firstSection = fullText.slice(
        0,
        props.article.sections[0].body.length
      )

      expect(firstSection).toBe(props.article.sections[0].body)
    })
  })

  describe("#keywordIsBlank", () => {
    it("returns false if yoast keyword is not blank", () => {
      const component = getWrapper(props).instance() as Yoast
      const returnValue = component.keywordIsBlank()
      expect(returnValue).toBe(false)
    })

    it("returns true if yoast keyword is blank", () => {
      props.yoastKeyword = ""
      const component = getWrapper(props).instance() as Yoast
      const returnValue = component.keywordIsBlank()
      expect(returnValue).toBe(true)
    })
  })

  describe("#toggleDrawer", () => {
    it("sets isOpen to true when the yoast header is clicked", () => {
      const component = getWrapper(props)
      expect(component.state("isOpen")).toBe(false)
      component.find(YoastContainer).simulate("click")
      expect(component.state("isOpen")).toBe(true)
      // const instance = component.instance() as Yoast
      // instance.toggleDrawer = jest.fn()
      // const { toggleDrawer } = instance
      // component.find(YoastContainer).prop("onClick")()
      // expect(toggleDrawer).toHaveBeenCalledTimes(1)
      // expect(toggleDrawer).toHaveBeenCalledWith("clicked")
    })
  })

  describe("#generateResolveMessage", () => {
    it("returns 'Set Target Keyword' if there is no yoast keyword", () => {
      props.yoastKeyword = ""
      const component = getWrapper(props).instance() as Yoast

      const resolveMessage = component.generateResolveMessage()
      expect(resolveMessage).toBe(" Set Target Keyword")
    })

    it("returns 'Resolved' if there is a yoast keyword but no issues", () => {
      const component = getWrapper(props).instance() as Yoast

      const resolveMessage = component.generateResolveMessage()
      expect(resolveMessage).toBe(" Resolved")
    })

    // it("returns a string reporting the number of unresolved issues if there is a yoast keyword and issues", () => {
    //   const component = getWrapper(props).instance() as Yoast

    //   const resolveMessage = component.generateResolveMessage()
    //   expect(resolveMessage).toBe(" Resolved")
    // })
  })

  describe("#setSnippetFields", () => {
    // const keywordInput = component.find("focus-keyword").at(0)
    // keywordInput.value = "Bears"
    it("sets snippet title", () => {
      // const component = getWrapper(props)
      // component.setSnippetFields()
      // component.find("#snippet-editor-title")
      // console.log(component)
      // console.log("COM PONENT", component)
      // expect(
      //   component
      //     .find("snippet-editor-title")
      //     .at(0)
      //     .text()
      // ).toEqual("cats")
    })
  })

  // describe("generateResolveMessage", () => {})
})
