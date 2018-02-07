import * as editActions from 'client/actions/editActions'
import _ from 'underscore'
import $ from 'jquery'
import React from 'react'
import ReactDOM from 'react-dom'
import Article from '../../models/article'
import EditContainer from './components/edit_container'
import EditLayout from './components/layout'
import { Provider } from 'react-redux'
import { reducers, initialState } from 'client/reducers'
import { createReduxStore } from 'client/lib/createReduxStore'
import { init as initWebsocket } from 'client/apps/websocket/client'
import { data as sd } from 'sharify'

export function init () {
  const article = new Article(sd.ARTICLE)
  const channel = sd.CURRENT_CHANNEL
  const author = _.pick(article.get('author'), 'id', 'name')
  const author_id = sd.USER.id

  article.set({
    author,
    author_id
  })
  article.sections.removeBlank()

  new EditLayout({ el: $('#layout-content'), article, channel })

  const store = createReduxStore(reducers, initialState)
  initWebsocket(store, sd.APP_URL)

  if (article.isNew()) {
    article.once('sync', () => {
      editActions.onFirstSave(article.get('id'))
    })
  }

  article.on('sync', () => {
    store.dispatch(editActions.changeSavedStatus(article.attributes, true))
  })

  article.on('finished', () => {
    $(document).ajaxStop(() => editActions.redirectToList(article.get('published')))
  })

  ReactDOM.render(
    <Provider store={store}>
      <EditContainer article={article} />
    </Provider>,
    $('#edit-content')[0]
  )
}
