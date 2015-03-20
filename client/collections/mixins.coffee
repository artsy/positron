#
# Mixin common methods
#

_ = require 'underscore'

@ApiCollection =

  parse: (data) ->
    { @total, @count } = data
    data.results

  getOrFetchIds: (ids, options = {}) ->
    ids = _.without ids, @pluck('id')...
    ids = _.reject ids, (id) -> not id
    return options.success? this unless ids.length
    @fetch
      data: ids: ids
      error: options.error
      remove: false
      success: options.success
      complete: options.complete

@Filter =

  notIn: (col) ->
    @reject (model) => model.id in col.pluck 'id'