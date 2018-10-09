import moment from "moment"
import React from "react"
import { Campaign } from "../../components/campaign.jsx"
import { mount } from "enzyme"

describe("Campaign Admin", () => {
  const start_date = moment().toISOString()
  const end_date = moment(start_date)
    .add(30, "days")
    .toISOString()
  const props = {
    campaign: {
      name: "Sample Campaign",
      start_date,
      end_date,
      sov: 0,
    },
    index: 0,
    onChange: jest.fn(),
  }

  it("renders all fields", () => {
    const component = mount(<Campaign {...props} />)
    expect(
      component
        .find("input")
        .at(0)
        .props().placeholder
    ).toMatch("Partner Name")
    expect(component.find('input[type="date"]').length).toBe(2)
    expect(component.find("select").length).toBe(1)
  })

  it("renders saved data", () => {
    const component = mount(<Campaign {...props} />)
    expect(
      component
        .find("input")
        .at(0)
        .instance().value
    ).toMatch(props.campaign.name)
    expect(
      component
        .find('input[type="date"]')
        .at(0)
        .instance().value
    ).toMatch(moment(start_date).format("YYYY-MM-DD"))
    expect(
      component
        .find('input[type="date"]')
        .at(1)
        .instance().value
    ).toMatch(moment(end_date).format("YYYY-MM-DD"))
    expect(
      component
        .find("select")
        .at(0)
        .instance().value
    ).toBe(props.campaign.sov.toString())
  })

  it("Changes the campaign name on input", () => {
    const component = mount(<Campaign {...props} />)
    const input = component.find("input").at(0)
    input.simulate("change", { target: { value: "Campaign Sample" } })
    expect(props.onChange.mock.calls[0][0]).toMatch("name")
    expect(props.onChange.mock.calls[0][1]).toMatch("Campaign Sample")
    expect(props.onChange.mock.calls[0][2]).toBe(props.index)
  })

  it("Changes the start date on input", () => {
    const component = mount(<Campaign {...props} />)
    const input = component.find('input[type="date"]').at(0)
    const newDate = moment(start_date)
      .add(1, "year")
      .toISOString()
    input.simulate("change", { target: { value: newDate } })
    expect(props.onChange.mock.calls[1][0]).toMatch("start_date")
    expect(props.onChange.mock.calls[1][1]).toMatch(newDate)
    expect(props.onChange.mock.calls[1][2]).toBe(props.index)
  })

  it("Changes the end date on input", () => {
    const component = mount(<Campaign {...props} />)
    const input = component.find('input[type="date"]').at(1)
    const newDate = moment(end_date)
      .add(1, "year")
      .toISOString()
    input.simulate("change", { target: { value: newDate } })
    expect(props.onChange.mock.calls[2][0]).toMatch("end_date")
    expect(props.onChange.mock.calls[2][1]).toMatch(newDate)
    expect(props.onChange.mock.calls[2][2]).toBe(props.index)
  })

  it("Changes the sov on select", () => {
    const component = mount(<Campaign {...props} />)
    const input = component.find("select")
    input.simulate("change", { target: { value: "0.2" } })
    expect(props.onChange.mock.calls[3][0]).toMatch("sov")
    expect(props.onChange.mock.calls[3][1]).toBe(0.2)
    expect(props.onChange.mock.calls[3][2]).toBe(props.index)
  })
})
