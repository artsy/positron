import * as appActions from 'client/actions/appActions'
import _ from 'underscore'
import $ from 'jquery'
import React from 'react'
import ReactDOM from 'react-dom'
import Article from '../../models/article'
import Channel from '../../models/channel'
import EditLayout from './components/layout'
import EditHeader from './components/header'
// import EditDisplay from './components/display'
import EditAdmin from './components/admin'
import EditContent from './components/content'
import { EditDisplay } from './components/display2'
import { Provider } from 'react-redux'
import { reducers, initialState } from 'client/reducers'
import { createReduxStore } from 'client/lib/createReduxStore'
import { data as sd } from 'sharify'

export function init () {
  const article = new Article(sd.ARTICLE)
  const channel = new Channel(sd.CURRENT_CHANNEL)
  const author = _.pick(article.get('author'), 'id', 'name')

  article.set({
    author
  })

  new EditLayout({ el: $('#layout-content'), article, channel })
  new EditHeader({ el: $('#edit-header'), article })
  // new EditDisplay({ el: $('#edit-display'), article })

  const store = createReduxStore(reducers, initialState)

  ReactDOM.render(
    <Provider store={store}>
      <EditDisplay
        article={article}
        channel={channel}
      />
    </Provider>,
    $('#edit-display')[0]
  )

  ReactDOM.render(
    <Provider store={store}>
      <EditAdmin
        article={article}
        channel={channel}
      />
    </Provider>,
    $('#edit-admin')[0]
  )

  ReactDOM.render(
    <Provider store={store}>
      <EditContent
        article={article}
        channel={channel}
      />
    </Provider>,
    $('#edit-content')[0]
  )

  // Example dispatch
  store.dispatch(appActions.helloWorld({
    status: 'hello how are you?'
  }))

  // Example of how to get state directly from store
  // console.log(store.getState())
}
