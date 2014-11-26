#
# Allows an admin to log in as another user.
#

express = require 'express'
routes = require './routes'

app = module.exports = express()
app.set 'views', __dirname + '/components'
app.set 'view engine', 'jade'

app.get '/impersonate/:id', (req, res, next) ->
  res.send 'impersonate!'