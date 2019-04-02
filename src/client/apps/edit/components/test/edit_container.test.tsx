import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { FullScreenProvider } from "@artsy/reaction/dist/Components/Publishing/Sections/FullscreenViewer/FullScreenProvider"
import { mount, shallow } from "enzyme"
import { cloneDeep } from "lodash"
import React from "react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import { EditAdmin } from "../admin"
import { EditContent } from "../content"
import { EditDisplay } from "../display"
import { EditContainer } from "../edit_container"
import { EditError } from "../error"
import { EditHeader } from "../header"
import { Yoast } from "../yoast"
require("typeahead.js")

jest.mock("superagent", () => {
  return {
    get: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    query: jest.fn().mockReturnValue({
      end: jest.fn(),
    }),
  }
})

describe("EditContainer", () => {
  let props

  const getWrapper = (passedProps = props) => {
    const mockStore = configureStore([])

    const store = mockStore({
      app: {
        channel: passedProps.channel,
      },
      edit: {
        activeView: passedProps.activeView,
        article: passedProps.article,
        error: passedProps.error,
        yoastKeyword: passedProps.yoastKeyword,
      },
    })

    return mount(
      <Provider store={store}>
        <FullScreenProvider>
          <EditContainer {...passedProps} />
        </FullScreenProvider>
      </Provider>,
      {
        // yoast needs component to be attached to document.body or it breaks because it can't find #yoast-output and #yoast-snippet
        attachTo: document.body,
      }
    )
  }

  const getShallowWrapper = (passedProps = props) => {
    return shallow(<EditContainer {...passedProps} />)
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
      yoastKeyword: "",
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
    getShallowWrapper()
    expect(props.toggleSpinnerAction.mock.calls[0][0]).toBe(false)
  })

  it("#componentDidMount does not hide the loading spinner if article is new", () => {
    delete props.article.id
    getShallowWrapper()
    expect(props.toggleSpinnerAction).not.toBeCalled()
  })

  it("#componentDidMount calls #setupLockout", () => {
    const component = getShallowWrapper().instance() as EditContainer
    component.setupLockout = jest.fn()
    component.componentDidMount()

    expect(component.setupLockout).toBeCalled()
  })

  it("#componentDidMount does not call #setupLockout if article is new", () => {
    delete props.article.id
    const component = getShallowWrapper().instance() as EditContainer
    component.setupLockout = jest.fn()
    component.componentDidMount()

    expect(component.setupLockout).not.toBeCalled()
  })

  it("sets up an event listener for #beforeUnload if article is published and changed", () => {
    const component = getShallowWrapper().instance() as EditContainer
    component.componentWillReceiveProps({ article: { published: true } })
    const windowListener = window.addEventListener as jest.Mock

    expect(windowListener.mock.calls[0][0]).toBe("beforeunload")
  })

  it("sends a #startEditingArticleAction when mounting", () => {
    const wrapper = getWrapper()
    expect(props.startEditingArticleAction.mock.calls[0][0]).toMatchObject({
      user: props.user,
      article: props.article.id,
    })
    wrapper.unmount()
  })

  it("sends a #stopEditingArticleAction when unmounting", () => {
    const wrapper = getWrapper()
    wrapper.unmount()
    expect(props.stopEditingArticleAction.mock.calls[0][0]).toMatchObject({
      user: props.user,
      article: props.article.id,
    })
  })

  it("sets #inactivityPeriodEntered to true after the standby time is exceeded", () => {
    jest.useFakeTimers()
    const assignFn = (window.document.location.assign = jest.fn())
    const instance = getWrapper()
      .find(EditContainer)
      .instance() as EditContainer
    expect(instance.state.inactivityPeriodEntered).toBeFalsy()

    jest.advanceTimersByTime(700 * 1000)

    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 600 * 1000)
    expect(instance.state.inactivityPeriodEntered).toBeTruthy()
    expect(assignFn).toBeCalledWith("/")
  })

  describe("Rendering", () => {
    it("Renders the EditHeader", () => {
      const component = getWrapper().find(EditContainer)
      expect(component.find(EditHeader).exists()).toBe(true)
    })

    it("Renders the Yoast header", () => {
      const component = getWrapper().find(EditContainer)
      expect(component.find(Yoast).exists()).toBe(true)
    })

    it("Doesn't render the Yoast header on a partner channel", () => {
      props.channel = { type: "partner" }
      const component = getWrapper().find(EditContainer)
      expect(component.find(Yoast).exists()).toBe(false)
    })

    describe("activeView", () => {
      it("Can render the content activeView", () => {
        const component = getWrapper().find(EditContainer)
        expect(component.find(EditContent).exists()).toBe(true)
      })

      it("Can render the admin activeView", () => {
        props.activeView = "admin"
        const component = getWrapper()

        expect(component.find(EditAdmin).exists()).toBe(true)
      })

      it("Can render the display activeView", () => {
        props.activeView = "display"
        const component = getWrapper().find(EditContainer)

        expect(component.find(EditDisplay).exists()).toBe(true)
      })
    })

    it("Displays an error message if present", () => {
      props.error = { message: "an error" }
      const component = getWrapper().find(EditContainer)

      expect(component.text()).toMatch(props.error.message)
      expect(component.find(EditError).exists()).toBe(true)
    })
  })
})
