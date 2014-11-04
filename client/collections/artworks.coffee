_ = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data

module.exports = class Artworks extends Backbone.Collection

  url: "#{sd.API_URL}/artworks"

  parse: (data) ->
    { @total, @count } = data
    data.results

  getOrFetchIds: (ids, options = {}) ->
    ids = _.without ids, @pluck('id')...
    ids = _.reject ids, (id) -> not id
    return options.success this unless ids.length
    new Artworks().fetch
      data: ids: ids
      error: options.error
      success: (artworks) =>
        @set artworks.models
        options.success this