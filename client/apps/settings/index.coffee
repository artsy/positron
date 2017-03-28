#
# CRUD for curations
#

express = require 'express'
routes = require './routes'

app = module.exports = express()
app.set 'views', __dirname + '/templates'
app.set 'view engine', 'jade'

app.get '/settings', routes.index
app.get '/settings/curations', routes.curations
app.get '/settings/curations/:id/edit', routes.editCuration
app.post '/settings/curations/:id', routes.saveCuration
app.get '/settings/channels', routes.channels
app.get '/settings/channels/:id/edit', routes.editChannel
app.post '/settings/channels/:id', routes.saveChannel