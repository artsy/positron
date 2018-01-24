import React from 'react'
import { render } from 'react-dom'
import { data as sd } from 'sharify'
import { Provider } from 'react-redux'
import { createReduxStore } from 'client/lib/createReduxStore'
import { reducers, initialState } from 'client/reducers'
import { init as initWebsocket } from 'client/apps/websocket/client'

import ArticlesListView from './components/listView'
import Channel from 'client/models/channel.coffee'

const store = createReduxStore(reducers, initialState)
initWebsocket(store)

export const init = () => (
  render(
    <Provider store={store}>
      <ArticlesListView
        articles={sd.ARTICLES}
        published={sd.HAS_PUBLISHED}
        channel={new Channel(sd.CURRENT_CHANNEL)}
      />
    </Provider>
  , document.getElementById('articles-list'))
)
