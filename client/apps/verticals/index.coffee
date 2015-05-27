#
# CRUD for verticals.
#

express = require 'express'
routes = require './routes'

app = module.exports = express()
app.set 'views', __dirname
app.set 'view engine', 'jade'

app.get '/verticals', routes.index
app.get '/verticals/:id/edit', routes.edit
app.get '/verticals/new', routes.edit
app.post '/verticals/:id', routes.save
app.post '/verticals', routes.save