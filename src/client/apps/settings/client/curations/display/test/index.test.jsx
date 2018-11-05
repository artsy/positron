import Backbone from "backbone"
import React from "react"
import DisplayAdmin from "../index.jsx"
import { mount } from "enzyme"

import { DropDownItem } from "client/components/drop_down/drop_down_item.jsx"
import { Canvas } from "../components/canvas/index.jsx"
import { Campaign } from "../components/campaign.jsx"
import { Panel } from "../components/panel/index.jsx"

describe("Display Admin", () => {
  global.confirm = jest.fn(() => true)

  const curation = new Backbone.Model({
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
  })
  const props = {
    curation,
  }

  it("renders correct buttons and components", () => {
    const component = mount(<DisplayAdmin {...props} />)
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
    const component = mount(<DisplayAdmin {...props} />)
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
    const component = mount(<DisplayAdmin {...props} />)
    component.instance().onChange("canvas.name", "New Title", 0)
    expect(component.state().curation.get("campaigns")[0].canvas.name).toMatch(
      "New Title"
    )
    expect(component.state().saveStatus).toMatch("Save")
    // FIXME TEST: Not sure...
    // expect(component.find('button').at(0).props().style.color).toMatch('rgb(247, 98, 90)')
  })

  it("Save button saves the curation", () => {
    const component = mount(<DisplayAdmin {...props} />)
    component.instance().save = jest.fn()
    component.instance().onChange("canvas.name", "New Title", 0)
    component
      .find("button")
      .at(0)
      .simulate("click")
    expect(component.instance().save).toHaveBeenCalled()
  })

  it("Add Campaign button adds a campaign and opens new panel on click", () => {
    const component = mount(<DisplayAdmin {...props} />)
    component
      .find("button")
      .at(1)
      .simulate("click")
    expect(component.find(DropDownItem).length).toBe(3)
    expect(component.state().curation.get("campaigns").length).toBe(3)
    expect(component.state().curation.get("campaigns")[2].sov).toBe(0.2)
  })

  it("Delete Campaign button prompts alert and removes campaign if confirmed", () => {
    const component = mount(<DisplayAdmin {...props} />)
    component
      .find(".DropDownItem__title")
      .at(1)
      .simulate("click")
    component
      .find("button")
      .at(0)
      .simulate("click")
    expect(global.confirm.mock.calls[0][0]).toMatch("Are you sure?")
    expect(component.state().curation.get("campaigns").length).toBe(2)
  })
})
