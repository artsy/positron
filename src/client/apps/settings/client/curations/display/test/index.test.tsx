import Backbone from "backbone"
import { DropDownItem } from "client/components/drop_down/drop_down_item"
import { mount } from "enzyme"
import React from "react"
import { Campaign } from "../components/campaign"
import { Canvas } from "../components/canvas"
import { Panel } from "../components/panel"
import DisplayAdmin from "../index"

const globalAny: any = global
globalAny.confirm = jest.fn(() => true)

describe("Display Admin", () => {
  let props
  const getWrapper = (passedProps = props) => {
    return mount(<DisplayAdmin {...passedProps} />)
  }

  beforeEach(() => {
    props = {
      curation: new Backbone.Model({
        name: "Display Admin",
        type: "display-admin",
        campaigns: [
          {
            name: "Sample Campaign 1",
            canvas: {},
            panel: {},
          },
          {
            name: "Sample Campaign 2",
            canvas: {},
            panel: {},
          },
        ],
      }),
    }
  })

  it("renders correct buttons and components", () => {
    const component = getWrapper()
    expect(component.find(DropDownItem).length).toBe(2)
    expect(
      component
        .find("button")
        .at(0)
        .text()
    ).toMatch("Saved")
    expect(
      component
        .find("button")
        .at(1)
        .text()
    ).toMatch("Add New Campaign")
  })

  it("opens a campaign admin panel on click", () => {
    const component = getWrapper()
    component
      .find(".DropDownItem__title")
      .at(1)
      .simulate("click")
    expect(
      component
        .find(".DropDownItem__title")
        .at(1)
        .props()["data-active"]
    ).toBe(true)
    expect(component.find(Campaign).length).toBe(1)
    expect(component.find(Panel).length).toBe(1)
    expect(component.find(Canvas).length).toBe(1)
  })

  it("#onChange updates state.campaign and changes the save button text/color", () => {
    const component = getWrapper()
    const instance = component.instance() as DisplayAdmin
    instance.onChange("canvas.name", "New Title", 0)
    expect(component.state().curation.get("campaigns")[0].canvas.name).toMatch(
      "New Title"
    )
    expect(component.state().saveStatus).toMatch("Save")
    // FIXME TEST: Not sure...
    // expect(component.find('button').at(0).props().style.color).toMatch('rgb(247, 98, 90)')
  })

  it("Save button saves the curation", () => {
    const component = getWrapper()
    const instance = component.instance() as DisplayAdmin

    instance.save = jest.fn()
    instance.onChange("canvas.name", "New Title", 0)
    component
      .find("button")
      .at(0)
      .simulate("click")
    expect(instance.save).toHaveBeenCalled()
  })

  it("Add Campaign button adds a campaign and opens new panel on click", () => {
    const component = getWrapper()
    component
      .find("button")
      .at(1)
      .simulate("click")
    expect(component.find(DropDownItem).length).toBe(3)
    expect(component.state().curation.get("campaigns").length).toBe(3)
    expect(component.state().curation.get("campaigns")[2].sov).toBe(0.2)
  })

  it("Delete Campaign button prompts alert and removes campaign if confirmed", () => {
    const component = getWrapper()
    component
      .find(".DropDownItem__title")
      .at(1)
      .simulate("click")
    component
      .find("button")
      .at(0)
      .simulate("click")

    expect(globalAny.confirm.mock.calls[0][0]).toMatch("Are you sure?")
    expect(component.state().curation.get("campaigns").length).toBe(1)
  })
})
