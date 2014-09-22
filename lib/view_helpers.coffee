#
# Export isomorphic libraries and functions you would like to use in templates.
# This will be injected in res.locals & exposed globally client-side for Jadeify.
#

module.exports =
  moment: require 'moment'