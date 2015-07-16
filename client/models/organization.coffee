Backbone = require 'backbone'
sd = require('sharify').data
async = require 'async'

module.exports = class Organization extends Backbone.Model

  urlRoot: "#{sd.API_URL}/organizations"

  fetchAuthors: (options) ->
    async.map @get('author_ids'), (id, cb) ->
      new Backbone.Model().fetch
        url: "#{sd.ARTSY_URL}/api/v1/user/#{id}"
        error: options.error
        success: (user) -> cb null, user
    , (err, authors) ->
      options.success? authors
