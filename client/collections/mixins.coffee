#
# Mixin common methods
#

_ = require 'underscore'
async = require 'async'

@ApiCollection =

  parse: (data) ->
    { @total, @count } = data
    data.results

@Filter =

  notIn: (col) ->
    @reject (model) => model.id in col.pluck 'id'

  getOrFetchIds: (ids, options = {}) ->
    async.map ids or [], (id, cb) =>
      new @model(id: id).fetch
        error: (m, err) -> cb null, err
        success: (model) -> cb null, model
    , (err, models) =>
      @add models
      options.complete?()
      return options.error? err if err
      options.success?()
