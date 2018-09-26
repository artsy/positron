import Backbone from "backbone"

export default class Session extends Backbone.Model {
  urlRoot = `${process.env.API_URL}/sessions`
}
