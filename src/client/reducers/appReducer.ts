import { data as sd } from "sharify"

// TODO: confirm attrs
interface UserState {
  name?: string
  id: string
  type?: string
}

export interface AppState {
  apiURL: string
  appURL: string
  artsyURL: string
  channel: any // TODO: add typing
  forceURL: string
  isAdmin: boolean
  isEditorial: boolean
  isPartnerChannel: boolean
  metaphysicsURL: string
  user: UserState
}

export const initialState: AppState = {
  apiURL: sd.API_URL,
  appURL: sd.APP_URL,
  artsyURL: sd.ARTSY_URL,
  channel: sd.CURRENT_CHANNEL,
  forceURL: sd.FORCE_URL,
  isAdmin: sd.USER.type === "Admin",
  isEditorial: sd.CURRENT_CHANNEL.type === "editorial",
  isPartnerChannel: sd.CURRENT_CHANNEL.type === "partner",
  metaphysicsURL: sd.GRAPHQL_ENDPOINT,
  user: sd.USER,
}

export const appReducer = (state = initialState, _action) => {
  return state
}
