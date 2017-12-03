import * as editActions from 'client/actions/editActions'
import _ from 'underscore'
import $ from 'jquery'
import React from 'react'
import ReactDOM from 'react-dom'
import Article from '../../models/article'
import Channel from '../../models/channel'
import EditContainer from './components/edit_container'
import EditLayout from './components/layout'
import EditDisplay from './components/display'
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
  new EditDisplay({ el: $('#edit-display'), article })

  const store = createReduxStore(reducers, initialState)

  article.on('sync', () => store.dispatch(editActions.changeSavedStatus(true)))

  ReactDOM.render(
    <Provider store={store}>
      <EditContainer
        article={article}
        channel={channel}
        user={sd.USER}
      />
    </Provider>,
    $('#edit-content')[0]
  )
}
