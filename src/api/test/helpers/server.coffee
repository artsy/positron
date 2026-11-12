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
baseUrl = null

module.exports.startServer = (portOrDone, maybeDone) ->
  [port, done] = if typeof portOrDone is 'function'
    [0, portOrDone]
  else
    [portOrDone, maybeDone]
  server = app.listen port, ->
    baseUrl = "http://localhost:#{server.address().port}"
    done?()
  server

# Reads the base URL captured when the server started listening (a string, not
# `server.address()`) so a request built after an unrelated test closed the
# shared server can't blow up on a null address.
module.exports.url = (path = '') ->
  "#{baseUrl}#{path}"

module.exports.closeServer = (done) ->
  s = server
  server = null
  return done?() unless s?
  s.close -> done?()
