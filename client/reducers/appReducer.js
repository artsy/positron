import { data as sd } from 'sharify'

export const initialState = {
  channel: sd.CURRENT_CHANNEL,
  isAdmin: sd.USER.type === 'Admin',
  user: sd.USER
}

export function appReducer (state = initialState, action) {
  return state
}
