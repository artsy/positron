import Backbone from "backbone"
import Session from "../models/session"

export default class Sessions extends Backbone.Collection {
  url = `${process.env.API_URL}/sessions`
  model = Session
}
