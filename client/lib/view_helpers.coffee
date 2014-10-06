#
# Export isomorphic libraries and functions you would like to use in templates.
# This will be injected in res.locals & exposed globally client-side for Jadeify.
#

url = require 'url'
qs = require 'querystring'
@moment = require 'moment'

# There has to be a better way to do this...
@mergeQueryParams = (uri, params) ->
  uri + (if url.parse(uri).query? then '&' else '?') + qs.stringify(params)