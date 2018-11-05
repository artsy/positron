import React from "react"
import { render } from "react-dom"
import { data as sd } from "sharify"
import { Provider } from "react-redux"
import { createReduxStore } from "client/lib/createReduxStore"
import { reducers, initialState } from "client/reducers"
import { init as initWebsocket } from "client/apps/websocket/client"

import ArticlesList from "./components/articles_list"

const store = createReduxStore(reducers, initialState)
initWebsocket(store, sd.APP_URL)

export const init = () =>
  render(
    <Provider store={store}>
      <ArticlesList articles={sd.ARTICLES} published={sd.HAS_PUBLISHED} />
    </Provider>,
    document.getElementById("articles-list")
  )
