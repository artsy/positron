import { debounce } from "lodash"
import keyMirror from "client/lib/keyMirror"
import { emitAction } from "client/apps/websocket/client"
import { messageTypes } from "client/apps/websocket/messageTypes"
import $ from "jquery"

export const actions = keyMirror(
  "CHANGE_VIEW",
  "UPDATE_ARTICLE",
  "START_EDITING_ARTICLE",
  "STOP_EDITING_ARTICLE",
  "REDIRECT_TO_LIST",
  "TOGGLE_SPINNER"
)

// TOGGLE EDIT TABS (Content, Admin, Display)
export const changeView = activeView => ({
  type: actions.CHANGE_VIEW,
  payload: {
    activeView,
  },
})

// ARTICLE LOCKOUT ACTIONS
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

export const debouncedUpdateDispatch = debounce((dispatch, options) => {
  dispatch(updateArticle(options))
}, 500)

// TRIGGERED ON SAVE + PUBLISH
export const redirectToList = published => {
  window.location.assign(`/articles?published=${published}`)

  return {
    type: actions.REDIRECT_TO_LIST,
  }
}

// LOADING SPINNER
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
