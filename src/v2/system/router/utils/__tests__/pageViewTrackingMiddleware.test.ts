import { ActionTypes } from "farce"
import { pageViewTrackingMiddleware } from "system/router/utils/pageViewTrackingMiddleware"

describe("pageViewTrackingMiddleware", () => {
  const store = {
    getState: jest.fn(() => ({
      found: {
        match: { location: { pathname: "/previous", search: "?query=123" } },
      },
    })),
  }
  const next = jest.fn()
  const action = {
    type: ActionTypes.UPDATE_LOCATION,
    payload: { pathname: "/new" },
  }
  const emptyAction = { type: "OTHER_ACTION", payload: {} }

  it("should handle UPDATE_LOCATION action", () => {
    Object.defineProperty(window, "location", {
      value: {
        origin: "http://test.com",
      },
      writable: true,
    })

    Object.defineProperty(window, "analytics", {
      value: {
        page: jest.fn(),
      },
      writable: true,
    })

    const middleware = pageViewTrackingMiddleware()(store)(next)

    middleware(action)

    expect(store.getState).toHaveBeenCalled()
    expect(window.analytics.page).toHaveBeenCalledWith({
      path: "/new",
      url: "http://test.com/new",
      referrer: "http://test.com/previous?query=123",
    })
    expect(next).toHaveBeenCalledWith(action)
  })

  it("should handle default action", () => {
    const middleware = pageViewTrackingMiddleware()(store)(next)

    middleware(emptyAction)

    expect(next).toHaveBeenCalledWith(emptyAction)
  })

  it("should not add referrer if previous location is empty", () => {
    store.getState.mockReturnValueOnce({
      found: { match: { location: {} as any } },
    })

    Object.defineProperty(window, "location", {
      value: {
        origin: "http://test.com",
      },
      writable: true,
    })

    Object.defineProperty(window, "analytics", {
      value: {
        page: jest.fn(),
      },
      writable: true,
    })

    const middleware = pageViewTrackingMiddleware()(store)(next)

    middleware(action)

    expect(window.analytics.page).toHaveBeenCalledWith({
      path: "/new",
      url: "http://test.com/new",
    })
  })
})
