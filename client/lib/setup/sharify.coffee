#
# WARNING! READ BELOW.
#
# Before you add anything to this file think if it's sensitive. This data will
# be exposed on the client-side so it can not include things like sensitive
# API keys or other credentials that should only be used server-side.
#
# If it is sensitive configuration you should only add it to config.coffee and
# require that file directly *only* server-side.
#
_ = require 'underscore'
sharify = require 'sharify'

sharify.data = _.pick process.env,
  'APP_URL', 'API_URL', 'NODE_ENV', 'FORCE_URL', 'ARTSY_URL', 'GEMINI_APP',
  'GEMINI_KEY', 'SEGMENT_WRITE_KEY', 'GEMINI_CLOUDFRONT_URL', 'TOPIC_TAG_CURATION', 'EF_VENICE'
