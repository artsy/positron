import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { ImageCollection } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Components"
import {
  ArticleImage,
  EditImage,
} from "client/apps/edit/components/content/sections/images/components/edit_image"
import { mount } from "enzyme"
import { extend } from "lodash"
import React from "react"
import { DragSource, DragSourceContainer } from "../drag_source"

describe("DragSource", () => {
  let props
  const image: ArticleImage = extend(ImageCollection[0], { type: "image" })

  const imageProps = {
    article: StandardArticle,
    image,
    index: 0,
    isHero: false,
    editing: false,
    section: ImageCollection,
    width: 200,
    onChangeHeroAction: jest.fn(),
    onChangeSectionAction: jest.fn(),
    progress: 0,
  }

  const getWrapper = (passedProps = props) => {
    return mount(
      <DragSource {...passedProps}>
        <EditImage {...imageProps} />
      </DragSource>
    )
  }

  beforeEach(() => {
    props = {
      isActiveSource: false,
      isDraggable: true,
      index: 2,
      onDragEnd: jest.fn(),
      setDragSource: jest.fn(),
    }
  })

  it("Renders children", () => {
    const component = getWrapper()
    expect(component.find(EditImage)).toHaveLength(1)
  })

  it("Calls #setDragSource onDragStart", () => {
    const component = getWrapper()
    component.find(DragSourceContainer).simulate("dragStart")
    expect(props.setDragSource).toBeCalled()
  })

  it("Calls props.onDragEnd onDragEnd", () => {
    const component = getWrapper()
    component.find(DragSourceContainer).simulate("dragEnd")
    expect(props.onDragEnd).toBeCalled()
  })

  describe("#setDragSource", () => {
    it("Calculates dragStartY and dragSourceHeight", () => {
      const component = getWrapper().instance() as DragSource
      component.setDragSource({ clientY: 250 })
      expect(props.setDragSource).toBeCalledWith(props.index, 0, 450)
    })

    it("Does nothing if isDraggable is false", () => {
      props.isDraggable = false
      const component = getWrapper().instance() as DragSource
      component.setDragSource({ clientY: 250 })
      expect(props.setDragSource).not.toBeCalled()
    })
  })
})
