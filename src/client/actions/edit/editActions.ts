import $ from "jquery"
import { debounce } from "lodash"
import { emitAction } from "../../apps/websocket/client"
import { messageTypes } from "../../apps/websocket/messageTypes"
import keyMirror from "../../lib/keyMirror"

export const actions = keyMirror(
  "CHANGE_VIEW",
  "UPDATE_ARTICLE",
  "START_EDITING_ARTICLE",
  "STOP_EDITING_ARTICLE",
  "REDIRECT_TO_LIST",
  "TOGGLE_SPINNER",
  "SET_YOAST_KEYWORD"
)

/**
 * Actions related to general article editing including
 * navigating edit tabs, article lockout actions, redirects,
 * and loading indicators
 */

/**
 * Toggle between content, admin and display tabs in edit UI
 */
export const changeView = (activeView: "content" | "display" | "admin") => ({
  type: actions.CHANGE_VIEW,
  payload: {
    activeView,
  },
})

/**
 * Article Lockout: user has started editing an article
 * TODO: rename to indicate lockout/disambiguate from changes to article data
 */
export const startEditingArticle = emitAction(data => {
  return {
    type: actions.START_EDITING_ARTICLE,
    key: messageTypes.userStartedEditing,
    payload: {
      timestamp: new Date().toISOString(),
      ...data,
    },
  }
})

/**
 * Article Lockout: user has made a change to an article
 * TODO: rename to indicate lockout/disambiguate from changes to article data
 */
export const updateArticle = emitAction(data => {
  return {
    type: actions.UPDATE_ARTICLE,
    key: messageTypes.userCurrentlyEditing,
    payload: {
      timestamp: new Date().toISOString(),
      ...data,
    },
  }
})

/**
 * Article Lockout: user has stopped editing an article
 * TODO: rename to indicate lockout/disambiguate from changes to article data
 */
export const stopEditingArticle = emitAction(data => {
  return {
    type: actions.STOP_EDITING_ARTICLE,
    key: messageTypes.userStoppedEditing,
    payload: {
      timestamp: new Date().toISOString(),
      ...data,
    },
  }
})

/**
 * Debounce updateArticle to avoid flooding API with requests
 */
export const debouncedUpdateDispatch = debounce((dispatch, options) => {
  dispatch(updateArticle(options))
}, 500)

/**
 * Redirect to /articles when publishing, deleting or saving a published article
 */
export const redirectToList = published => {
  window.location.assign(`/articles?published=${published}`)

  return {
    type: actions.REDIRECT_TO_LIST,
  }
}

/**
 * Store data entered into the Yoast UI input
 */
export const setYoastKeyword = yoastKeyword => {
  return {
    type: actions.SET_YOAST_KEYWORD,
    payload: {
      yoastKeyword,
    },
  }
}

/**
 * Show/hide loading spinner (when loading an article)
 * TODO: Use palette spinner
 */
export const toggleSpinner = isVisible => {
  if (isVisible) {
    $("#edit-sections-spinner").show()
  } else {
    $("#edit-sections-spinner").hide()
  }

  return {
    type: actions.TOGGLE_SPINNER,
  }
}
