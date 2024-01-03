import { data as sd } from "sharify"

interface ChannelState {
  name?: string
  id: string
  type?: string
}

interface UserState {
  access_token?: string
  channel_ids?: string[]
  current_channel?: ChannelState
  email?: string
  id: string
  name?: string
  partner_ids?: string[]
  type?: string
}

export interface AppState {
  apiURL: string
  appURL: string
  artsyURL: string
  channel: ChannelState
  forceURL: string
  isAdmin: boolean
  hasEditorialRole: boolean
  isEditorial: boolean
  isPartnerChannel: boolean
  metaphysicsURL: string
  user: UserState
}

/**
 * App-wide vars - contains info we previously referenced via SD
 * including user/channel and booleans based on user/channel types,
 * as well as commonly referenced app URLs
 */
export const getInitialState = () =>
  ({
    apiURL: sd.API_URL,
    appURL: sd.APP_URL,
    artsyURL: sd.ARTSY_URL,
    channel: sd.CURRENT_CHANNEL,
    forceURL: sd.FORCE_URL,
    isAdmin: sd.USER && sd.USER.type === "Admin",
    hasEditorialRole:
      sd.USER && sd.USER.roles && sd.USER.roles.includes("editorial"),
    isEditorial: sd.CURRENT_CHANNEL && sd.CURRENT_CHANNEL.type === "editorial",
    isPartnerChannel:
      sd.CURRENT_CHANNEL && sd.CURRENT_CHANNEL.type === "partner",
    metaphysicsURL: sd.GRAPHQL_ENDPOINT,
    user: sd.USER,
  } as AppState)

export const appReducer = (state = getInitialState(), _action) => {
  return state
}
