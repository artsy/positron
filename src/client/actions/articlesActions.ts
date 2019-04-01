import { emitAction } from "client/apps/websocket/client"
import { messageTypes } from "client/apps/websocket/messageTypes"
import keyMirror from "client/lib/keyMirror"
import { Channel } from "client/typings"

export const actions = keyMirror("VIEW_ARTICLES", "EDITED_ARTICLES_RECEIVED")

/**
 * Actions related to viewing the articles list view at /articles
 */

/**
 * Called when visiting /articles, updates list to indicate
 * articles that are currently being edited by other users
 */
export const viewArticles = emitAction((channel: Channel) => ({
  type: actions.VIEW_ARTICLES,
  key: messageTypes.articlesRequested,
  payload: {
    channel,
    timestamp: new Date().toISOString(),
  },
}))
