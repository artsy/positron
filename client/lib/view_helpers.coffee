#
# Export isomorphic libraries and functions you would like to use in templates.
# This will be injected in res.locals & exposed globally client-side for Jadeify.
#

sd = require('sharify').data

@moment = require 'moment'
@_ = require 'underscore'
{ @crop, @resize, @fill } = require('embedly-view-helpers')(sd.EMBEDLY_KEY)