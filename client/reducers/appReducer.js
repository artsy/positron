import Channel from '../models/channel'
import { data as sd } from 'sharify'

export const initialState = {
  channel: new Channel(sd.CHANNEL)
}

export function appReducer (state = initialState, action) {
  return state
}
