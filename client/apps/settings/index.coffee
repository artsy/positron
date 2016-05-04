#
# CRUD for curations
#

express = require 'express'
routes = require './routes'

app = module.exports = express()
app.set 'views', __dirname
app.set 'view engine', 'jade'

app.get '/settings', routes.index
app.get '/settings/:id/edit', routes.edit
app.post '/settings/:id', routes.save
