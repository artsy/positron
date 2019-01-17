import { LargeSelect } from "@artsy/palette"
import { Input } from "@artsy/reaction/dist/Components/Input"
import { mount } from "enzyme"
import moment from "moment"
import React from "react"
import { Campaign } from "../campaign"

describe("Campaign Admin", () => {
  const start_date = moment().toISOString()
  const end_date = moment(start_date)
    .add(30, "days")
    .toISOString()

  let props
  const getWrapper = (passedProps = props) => {
    return mount(<Campaign {...passedProps} />)
  }

  beforeEach(() => {
    props = {
      campaign: {
        name: "Sample Campaign",
        start_date,
        end_date,
        sov: 0.2,
      },
      index: 0,
      onChange: jest.fn(),
    }
  })

  it("renders all fields", () => {
    const component = getWrapper()
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
    const component = getWrapper()
    expect(
      component
        .find(Input)
        .at(0)
        .props().defaultValue
    ).toMatch(props.campaign.name)
    expect(
      component
        .find(Input)
        .at(1)
        .props().defaultValue
    ).toMatch(moment(start_date).format("YYYY-MM-DD"))
    expect(
      component
        .find(Input)
        .at(2)
        .props().defaultValue
    ).toMatch(moment(end_date).format("YYYY-MM-DD"))
    expect(
      component
        .find(LargeSelect)
        .at(0)
        .props().selected
    ).toBe(props.campaign.sov.toString())
  })

  it("Changes the campaign name on input", () => {
    const component = getWrapper()
    const input = component
      .find(Input)
      .at(0)
      .instance() as Input
    const event = ({
      currentTarget: {
        value: "Campaign Sample",
      },
    } as unknown) as React.FormEvent<HTMLInputElement>
    input.onChange(event)

    expect(props.onChange.mock.calls[0][0]).toMatch("name")
    expect(props.onChange.mock.calls[0][1]).toMatch("Campaign Sample")
    expect(props.onChange.mock.calls[0][2]).toBe(props.index)
  })

  it("Changes the start date on input", () => {
    const component = getWrapper()
    const newDate = moment(start_date)
      .add(1, "year")
      .toISOString()
    const input = component
      .find(Input)
      .at(1)
      .instance() as Input
    const event = ({
      currentTarget: {
        value: newDate,
      },
    } as unknown) as React.FormEvent<HTMLInputElement>
    input.onChange(event)

    expect(props.onChange.mock.calls[0][0]).toMatch("start_date")
    expect(props.onChange.mock.calls[0][1]).toMatch(newDate)
    expect(props.onChange.mock.calls[0][2]).toBe(props.index)
  })

  it("Changes the end date on input", () => {
    const component = getWrapper()
    const newDate = moment(end_date)
      .add(1, "year")
      .toISOString()
    const input = component
      .find(Input)
      .at(2)
      .instance() as Input
    const event = ({
      currentTarget: {
        value: newDate,
      },
    } as unknown) as React.FormEvent<HTMLInputElement>

    input.onChange(event)
    expect(props.onChange.mock.calls[0][0]).toMatch("end_date")
    expect(props.onChange.mock.calls[0][1]).toMatch(newDate)
    expect(props.onChange.mock.calls[0][2]).toBe(props.index)
  })

  it("Changes the sov on select", () => {
    const component = getWrapper()
    component
      .find(LargeSelect)
      .at(0)
      .props()
      .onSelect("0.2")

    expect(props.onChange.mock.calls[0][0]).toMatch("sov")
    expect(props.onChange.mock.calls[0][1]).toBe(0.2)
    expect(props.onChange.mock.calls[0][2]).toBe(props.index)
  })
})
