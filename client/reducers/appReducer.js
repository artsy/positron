import Channel from '../models/channel'
import { data as sd } from 'sharify'

export const initialState = {
  channel: new Channel(sd.CURRENT_CHANNEL),
  isAdmin: sd.USER.type === 'Admin'
}

export function appReducer (state = initialState, action) {
  return state
}
