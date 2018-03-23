express = require 'express'
{ setUser, authenticated, ownerOrAdminOnly, show, refresh } = require './routes'

app = module.exports = express()

app.get '/users/me', setUser, show
app.get '/users/me/refresh', refresh
