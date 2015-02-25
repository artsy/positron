express = require 'express'
{ setUser, ownerOrAdminOnly, show, create, index } = require './routes'

app = module.exports = express()

app.get '/users/:id', setUser, ownerOrAdminOnly, show
app.post '/users', setUser, ownerOrAdminOnly, create
app.get '/users', ownerOrAdminOnly, index