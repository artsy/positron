import { data as sd } from 'sharify'

export const initialState = {
  channel: sd.CURRENT_CHANNEL,
  isAdmin: sd.USER.type === 'Admin',
  user: sd.USER,
  appURL: sd.APP_URL,
  forceURL: sd.FORCE_URL,
  apiURL: sd.API_URL
}

export function appReducer (state = initialState, action) {
  return state
}
