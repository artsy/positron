import $ from "jquery"
import React from "react"
import ReactDOM from "react-dom"
import Article from "../../models/article.coffee"
import EditContainer from "./components/edit_container"
import EditLayout from "./components/layout"
import { Provider } from "react-redux"
import { reducers, initialState } from "client/reducers"
import { createReduxStore } from "client/lib/createReduxStore"
import { init as initWebsocket } from "client/apps/websocket/client"
import { saveArticle } from "client/actions/edit/articleActions"
import { data as sd } from "sharify"

export function init() {
  const article = new Article(sd.ARTICLE)
  const channel = sd.CURRENT_CHANNEL

  new EditLayout({ el: $("#layout-content"), article, channel })

  const store = createReduxStore(reducers, initialState)
  initWebsocket(store, sd.APP_URL)

  if (article.isNew()) {
    store.dispatch(saveArticle())
  }

  ReactDOM.render(
    <Provider store={store}>
      <EditContainer />
    </Provider>,
    $("#edit-content")[0]
  )
}
