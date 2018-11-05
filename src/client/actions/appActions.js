import keyMirror from "client/lib/keyMirror"

export const actions = keyMirror("HELLO_WORLD", "LOGIN", "LOGOUT")

export const helloWorld = ({ status }) => ({
  type: actions.HELLO_WORLD,
  payload: {
    status,
  },
})

export const login = () => ({
  type: actions.LOGIN,
})

export const logout = () => ({
  type: actions.LOGOUT,
})
