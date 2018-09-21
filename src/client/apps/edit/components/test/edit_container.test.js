import React from "react"
import configureStore from "redux-mock-store"
import { Provider } from "react-redux"
import { cloneDeep } from "lodash"
import { mount, shallow } from "enzyme"
import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { EditContainer } from "../edit_container"
import { EditAdmin } from "../admin"
import { EditContent } from "../content"
import { EditDisplay } from "../display"
import { EditHeader } from "../header"
import { EditError } from "../error"
require("typeahead.js")

jest.mock("superagent", () => {
  return {
    get: jest.genMockFunction().mockReturnThis(),
    set: jest.genMockFunction().mockReturnThis(),
    query: jest.fn().mockReturnValue({
      end: jest.fn(),
    }),
  }
})

describe("EditContainer", () => {
  let props

  const getWrapper = props => {
    const mockStore = configureStore([])

    const store = mockStore({
      app: {
        channel: props.channel,
      },
      edit: {
        activeView: props.activeView,
        article: props.article,
        error: props.error,
      },
    })

    return mount(
      <Provider store={store}>
        <EditContainer {...props} />
      </Provider>
    )
  }

  const getShallowWrapper = props => {
    return shallow(<EditContainer {...props} />)
  }

  beforeEach(() => {
    props = {
      activeView: "content",
      article: cloneDeep(StandardArticle),
      changeSavedStatusAction: jest.fn(),
      channel: {},
      error: {},
      isSaved: false,
      saveArticleAction: jest.fn(),
      toggleSpinnerAction: jest.fn(),
      startEditingArticleAction: jest.fn(),
      stopEditingArticleAction: jest.fn(),
      updateArticleAction: jest.fn(),
      user: {
        id: "123",
        name: "John Doe",
      },
      currentSession: {
        user: {
          id: "123",
        },
      },
    }
    window.addEventListener = jest.fn()
  })

  it("#componentDidMount hides the loading spinner", () => {
    getShallowWrapper(props)
    expect(props.toggleSpinnerAction.mock.calls[0][0]).toBe(false)
  })

  it("#componentDidMount does not hide the loading spinner if article is new", () => {
    delete props.article.id
    getShallowWrapper(props)
    expect(props.toggleSpinnerAction).not.toBeCalled()
  })

  it("#componentDidMount calls #setupLockout", () => {
    const component = getShallowWrapper(props)
    component.instance().setupLockout = jest.fn()
    component.instance().componentDidMount()

    expect(component.instance().setupLockout).toBeCalled()
  })

  it("#componentDidMount does not call #setupLockout if article is new", () => {
    delete props.article.id
    const component = getShallowWrapper(props)
    component.instance().setupLockout = jest.fn()
    component.instance().componentDidMount()

    expect(component.instance().setupLockout).not.toBeCalled()
  })

  it("sets up an event listener for #beforeUnload if article is published and changed", () => {
    const component = getShallowWrapper(props)
    component
      .instance()
      .componentWillReceiveProps({ article: { published: true } })

    expect(window.addEventListener.mock.calls[0][0]).toBe("beforeunload")
  })

  it("sends a #startEditingArticleAction when mounting", () => {
    const wrapper = getWrapper(props)
    expect(props.startEditingArticleAction.mock.calls[0][0]).toMatchObject({
      user: props.user,
      article: props.article.id,
    })
    wrapper.unmount()
  })

  it("sends a #stopEditingArticleAction when unmounting", () => {
    const wrapper = getWrapper(props)
    wrapper.unmount()
    expect(props.stopEditingArticleAction.mock.calls[0][0]).toMatchObject({
      user: props.user,
      article: props.article.id,
    })
  })

  it("sets #inactivityPeriodEntered to true after the standby time is exceeded", () => {
    jest.useFakeTimers()
    const assignFn = (window.document.location.assign = jest.fn())
    const wrapper = getWrapper(props)
    const instance = wrapper.find(EditContainer).instance()
    expect(instance.state.inactivityPeriodEntered).toBeFalsy()

    jest.advanceTimersByTime(700 * 1000)

    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 600 * 1000)
    expect(instance.state.inactivityPeriodEntered).toBeTruthy()
    expect(assignFn).toBeCalledWith("/")
  })

  describe("Rendering", () => {
    it("Renders the EditHeader", () => {
      const component = getWrapper(props).find(EditContainer)
      expect(component.find(EditHeader).exists()).toBe(true)
    })

    describe("activeView", () => {
      it("Can render the content activeView", () => {
        const component = getWrapper(props).find(EditContainer)
        expect(component.find(EditContent).exists()).toBe(true)
      })

      it("Can render the admin activeView", () => {
        props.activeView = "admin"
        const component = getWrapper(props)

        expect(component.find(EditAdmin).exists()).toBe(true)
      })

      it("Can render the display activeView", () => {
        props.activeView = "display"
        const component = getWrapper(props).find(EditContainer)

        expect(component.find(EditDisplay).exists()).toBe(true)
      })
    })

    it("Displays an error message if present", () => {
      props.error = { message: "an error" }
      const component = getWrapper(props).find(EditContainer)

      expect(component.text()).toMatch(props.error.message)
      expect(component.find(EditError).exists()).toBe(true)
    })
  })
})
