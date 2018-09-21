import keyMirror from "client/lib/keyMirror"

export const actions = keyMirror("ERROR")

export const logError = error => ({
  type: actions.ERROR,
  payload: {
    error,
  },
})

export const resetError = () => ({
  type: actions.ERROR,
  payload: {
    error: null,
  },
})
