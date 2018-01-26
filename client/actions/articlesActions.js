import keyMirror from 'client/lib/keyMirror'
import { emitAction } from 'client/apps/websocket/client'
import { messageTypes } from 'client/apps/websocket/messageTypes'

export const actions = keyMirror(
  'VIEW_ARTICLES',
  'EDITED_ARTICLES_RECEIVED'
)

export const viewArticles = emitAction(() => ({
  type: actions.VIEW_ARTICLES,
  key: messageTypes.articlesRequested,
  payload: {
    timestamp: new Date().toISOString()
  }
}))
