import { ActionTypes } from "farce"
import { isEmpty } from "lodash"

export const pageViewTrackingMiddleware = () => {
  return (store) => (next) => (action) => {
    const { type, payload } = action

    switch (type) {
      case ActionTypes.UPDATE_LOCATION: {
        const { pathname } = payload

        const state = store.getState()
        const prevLocation = state.found?.match?.location ?? {}
        const origin = window.location.origin

        const trackingPayload: {
          path: string
          url: string
          referrer?: string
        } = {
          path: pathname,
          url: origin + pathname,
        }

        if (!isEmpty(prevLocation)) {
          const referrer = origin + prevLocation.pathname + prevLocation.search
          if (referrer) {
            trackingPayload.referrer = referrer
          }
        }

        window.analytics?.page(trackingPayload)

        return next(action)
      }
      default: {
        return next(action)
      }
    }
  }
}
