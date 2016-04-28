#
# Export isomorphic libraries and functions you would like to use in templates.
# This will be injected in res.locals & exposed globally client-side for Jadeify.
#

sd = require('sharify').data

@moment = require 'moment'
@_ = require 'underscore'
@_s = require 'underscore.string'
{ @crop, @resize, @fill } = require '../components/resizer/index.coffee'
