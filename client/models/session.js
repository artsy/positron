import Backbone from 'backbone'
import { data as sd } from 'sharify'

export default class Session extends Backbone.Model {
  urlRoot = `${sd.API_URL}/sessions`
}
