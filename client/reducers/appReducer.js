import { data as sd } from 'sharify'

export const initialState = {
  apiURL: sd.API_URL,
  appURL: sd.APP_URL,
  artsyURL: sd.ARTSY_URL,
  channel: sd.CURRENT_CHANNEL,
  forceURL: sd.FORCE_URL,
  isAdmin: sd.USER.type === 'Admin',
  metaphysicsURL: sd.GRAPHQL_ENDPOINT,
  user: sd.USER
}

export function appReducer (state = initialState, action) {
  return state
}
