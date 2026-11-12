#
# Shared lifecycle helpers for the API app in integration tests.
#
# Tests run serially in a single process and all share the one cached `app`
# instance, so shared resources like ports must be managed carefully.
# `startServer` binds an OS-assigned ephemeral port by default (pass an
# explicit port only when a test self-calls antigravity at a fixed
# ARTSY_URL), `closeServer` waits for the port to actually be released, and
# `url` builds request URLs from whatever port got assigned.
#
app = require '../../'

server = null

module.exports.startServer = (portOrDone, maybeDone) ->
  [port, done] = if typeof portOrDone is 'function'
    [0, portOrDone]
  else
    [portOrDone, maybeDone]
  server = app.listen port, -> done?()
  server

module.exports.url = (path = '') ->
  "http://localhost:#{server.address().port}#{path}"

module.exports.closeServer = (done) ->
  s = server
  server = null
  return done?() unless s?
  s.close -> done?()
