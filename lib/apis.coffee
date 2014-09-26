#
# Shortcuts to Spooky & Gravity halbone clients.
#

halbone = require './halbone'
sd = require('sharify').data

@spooky = halbone(sd.SPOOKY_URL)
@spooky.tap (req) ->
  req.withRequestOptions qs: 'token': sd.SPOOKY_TOKEN

@gravity = halbone(sd.ARTSY_URL + '/api')
@gravity.tap (req) ->
  req.withRequestOptions headers: 'Accept': 'application/vnd.artsy-v2+json'