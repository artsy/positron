import Backbone from 'backbone'
import Session from '../models/session'
import { data as sd } from 'sharify'

export default class Sessions extends Backbone.Collection {
  url = `${sd.API_URL}/sessions`
  model = Session
}
