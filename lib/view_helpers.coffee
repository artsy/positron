#
# Export isomorphic libraries and functions you would like to use in templates.
# This will injected in res.locals & exposed globally on the client for Jadeify.
#

module.exports =
  moment: require 'moment'