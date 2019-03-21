import keyMirror from "client/lib/keyMirror"

export const actions = keyMirror("ERROR")

/**
 * Actions related to rendering errors to the client via ErrorBoundary
 */
export const logError = (error: { message: string }) => ({
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
