import React from "react"
import { render } from "react-dom"
import { data as sd } from "sharify"
import { Provider } from "react-redux"
import { createReduxStore } from "client/lib/createReduxStore"
import { reducers, initialState } from "client/reducers"
import { QueueView } from "./client.coffee"

const store = createReduxStore(reducers, initialState)

export const init = () => {
  const props = {
    scheduledArticles: sd.SCHEDULED_ARTICLES,
    feed: "scheduled",
    channel: sd.CURRENT_CHANNEL,
  }
  return render(
    <Provider store={store}>
      <QueueView {...props} />
    </Provider>,
    document.getElementById("queue-root")
  )
}
