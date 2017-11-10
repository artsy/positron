import keyMirror from 'client/lib/keyMirror'

export const actions = keyMirror(
  'LOGIN',
  'LOGOUT'
)

export const login = () => ({
  type: actions.LOGIN
})

export const logout = () => ({
  type: actions.LOGOUT
})
