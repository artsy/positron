import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { DropDownList } from "client/components/drop_down/drop_down_list"
import { mount } from "enzyme"
import { cloneDeep } from "lodash"
import React from "react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import { DisplayEmail } from "../components/email"
import { DisplayMagazine } from "../components/magazine"
import { DisplayPartner } from "../components/partner"
import { DisplaySearch } from "../components/search"
import { DisplaySocial } from "../components/social"
import EditDisplay from "../index"

describe("EditDisplay", () => {
  let props

  const getWrapper = (passedProps = props) => {
    const mockStore = configureStore([])

    const store = mockStore({
      app: {
        channel: passedProps.channel,
      },
      edit: {
        article: passedProps.article,
      },
    })

    return mount(
      <Provider store={store}>
        <EditDisplay {...passedProps} />
      </Provider>
    )
  }

  beforeEach(() => {
    props = {
      article: cloneDeep(StandardArticle),
      channel: { type: "editorial" },
      onChange: jest.fn(),
    }
    props.article.email_metadata = {}
  })

  it("Renders section-list for non-partners, opens magazine panel by default", () => {
    const component = getWrapper()

    expect(component.find(DropDownList).exists()).toBe(true)
    expect(component.find(DisplayMagazine).exists()).toBe(true)
    expect(component.find(DisplayPartner).exists()).toBe(false)
  })

  it("Can dispay the social panel on click", () => {
    const component = getWrapper()
    component
      .find(".DropDownItem__title")
      .at(1)
      .simulate("click")
    const dropDownList = component.find(DropDownList).instance() as DropDownList

    expect(dropDownList.state.activeSections[1]).toBe(1)
    expect(component.find(DisplaySocial).exists()).toBe(true)
  })

  it("Can dispay the search panel on click", () => {
    const component = getWrapper()
    component
      .find(".DropDownItem__title")
      .at(2)
      .simulate("click")
    const dropDownList = component.find(DropDownList).instance() as DropDownList

    expect(dropDownList.state.activeSections[1]).toBe(2)
    expect(component.find(DisplaySearch).exists()).toBe(true)
  })

  it("Can dispay the email panel on click", () => {
    const component = getWrapper()
    component
      .find(".DropDownItem__title")
      .at(3)
      .simulate("click")
    const dropDownList = component.find(DropDownList).instance() as DropDownList

    expect(dropDownList.state.activeSections[1]).toBe(3)
    expect(component.find(DisplayEmail).exists()).toBe(true)
  })

  it("Renders partner panel for partners", () => {
    props.channel.type = "partner"
    const component = getWrapper()

    expect(component.find(DisplayPartner).exists()).toBe(true)
    expect(component.find(DropDownList).exists()).toBe(false)
    expect(component.find(DisplayMagazine).exists()).toBe(false)
  })
})
