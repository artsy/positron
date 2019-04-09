import { Theme } from "@artsy/palette"
import { init as initWebsocket } from "client/apps/websocket/client"
import { createReduxStore } from "client/lib/createReduxStore"
import { initialState, reducers } from "client/reducers"
import React from "react"
import { render } from "react-dom"
import { Provider } from "react-redux"
import { data as sd } from "sharify"
import ArticlesList from "./components/articles_list"

const store = createReduxStore(reducers, initialState)
initWebsocket(store, sd.APP_URL)

export const init = () =>
  render(
    <Provider store={store}>
      <Theme>
        <ArticlesList articles={sd.ARTICLES} published={sd.HAS_PUBLISHED} />
      </Theme>
    </Provider>,
    document.getElementById("articles-list")
  )
