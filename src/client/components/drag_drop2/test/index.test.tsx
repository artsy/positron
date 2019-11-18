import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { ImageCollection } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Components"
import {
  ArticleImage,
  EditImage,
} from "client/apps/edit/components/content/sections/images/components/edit_image"
import { DragSource } from "client/components/drag_drop2/drag_source"
import { DragTarget } from "client/components/drag_drop2/drag_target"
import { mount } from "enzyme"
import { extend } from "lodash"
import React from "react"
import { DragDropList } from "../index"

describe("DragDropList", () => {
  let props
  const image1: ArticleImage = extend(ImageCollection[0], { type: "image" })
  const image2: ArticleImage = extend(ImageCollection[1], { type: "image" })

  const imageProps = {
    article: StandardArticle,
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
      <DragDropList {...passedProps}>
        <EditImage index={0} image={image1} {...imageProps} isDraggable />
        <EditImage index={1} image={image2} {...imageProps} isDraggable />
      </DragDropList>
    )
  }

  beforeEach(() => {
    props = {
      items: [image1, image2],
      dimensions: [{ width: 200 }, { width: 250 }],
      isDraggable: true,
      isVertical: false,
      isWrapping: false,
      onDragEnd: jest.fn(),
    }
  })

  it("Renders children if !isDraggable", () => {
    props.isDraggable = false
    const component = getWrapper()
    expect(component.find(EditImage).length).toBe(2)
    expect(component.find(DragTarget).length).toBe(0)
    expect(component.find(DragSource).length).toBe(0)
  })

  it("Wraps children in drag elements if isDraggable", () => {
    const component = getWrapper()
    expect(component.find(EditImage).length).toBe(2)
    expect(component.find(DragTarget).length).toBe(2)
    expect(component.find(DragSource).length).toBe(2)
  })

  it("#setDragSource sets state dragSource, dragStartY and draggingHeight", () => {
    const component = getWrapper()
    const instance = component.instance() as DragDropList
    instance.setDragSource(1, 300, 200)

    expect(component.state()).toEqual({
      dragSource: 1,
      dragTarget: null,
      dragStartY: 200,
      draggingHeight: 300,
      dropPosition: "top",
    })
  })

  it("#setDragTarget gets dropPosition and sets state", () => {
    const component = getWrapper()
    component.setState({ dragSource: 0 })
    const instance = component.instance() as DragDropList
    instance.setDragTarget(1, { top: 300, bottom: 400 }, 200)

    expect(instance.state.dragTarget).toBe(1)
    expect(instance.state.dropPosition).toBe("top")
  })

  describe("#setDropZonePosition", () => {
    const dragTarget = { top: 300, bottom: 400 }

    it("returns top if !isVertical", () => {
      const component = getWrapper()
      const instance = component.instance() as DragDropList
      expect(instance.setDropZonePosition(dragTarget, 0, 400)).toBe("top")
    })

    it("returns bottom if dragging below center", () => {
      props.isVertical = true
      const component = getWrapper()
      const instance = component.instance() as DragDropList
      expect(instance.setDropZonePosition(dragTarget, 1, 400)).toBe("bottom")
    })

    it.only("returns bottom if target is element after dragSource", () => {
      props.isVertical = true
      const component = getWrapper()
      component.setState({ dragSource: 0 })
      const instance = component.instance() as DragDropList
      expect(instance.setDropZonePosition(dragTarget, 1, 100)).toBe("bottom")
    })
  })

  describe("#onDragEnd", () => {
    it("Does nothing if target and source have same index", () => {
      const component = getWrapper()
      component.setState({ dragSource: 1, dragTarget: 1 })
      const instance = component.instance() as DragDropList
      instance.onDragEnd()

      expect(props.onDragEnd).not.toBeCalled()
      expect(instance.state.dragSource).toBe(1)
    })

    it("Calls props.onDragEnd with new array order", () => {
      const component = getWrapper()
      component.setState({ dragSource: 1, dragTarget: 0 })
      const instance = component.instance() as DragDropList
      instance.onDragEnd()

      expect(props.onDragEnd).toBeCalledWith([image2, image1])
    })

    it("Resets state drag data", () => {
      const component = getWrapper()
      component.setState({ dragSource: 1, dragTarget: 0 })
      const instance = component.instance() as DragDropList
      instance.onDragEnd()

      expect(component.state()).toEqual({
        dragSource: undefined,
        dragTarget: null,
        dragStartY: 0,
        draggingHeight: 0,
        dropPosition: "top",
      })
    })
  })

  describe("#setTargetWidth", () => {
    it("returns dimensions of item index", () => {
      const component = getWrapper()
      const instance = component.instance() as DragDropList
      expect(instance.setTargetWidth(0)).toBe(200)
      expect(instance.setTargetWidth(1)).toBe(250)
    })

    it("returns dimensions of item index * 2 if isWrapping", () => {
      props.isWrapping = true
      const component = getWrapper()
      const instance = component.instance() as DragDropList
      expect(instance.setTargetWidth(0)).toBe(400)
      expect(instance.setTargetWidth(1)).toBe(500)
    })
  })
})
