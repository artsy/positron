#
# CRUD for curations
#

express = require 'express'
routes = require './routes'

app = module.exports = express()
app.set 'views', __dirname + '/templates'
app.set 'view engine', 'jade'
{ adminOnly } = require '../../lib/middleware.coffee'

app.get '/settings', adminOnly, routes.index
app.get '/settings/curations', adminOnly, routes.curations
app.get '/settings/curations/:id/edit', adminOnly, routes.editCuration
app.post '/settings/curations/:id', adminOnly, routes.saveCuration
app.get '/settings/channels', adminOnly, routes.channels
app.get '/settings/channels/:id/edit', adminOnly, routes.editChannel
app.post '/settings/channels/:id', adminOnly, routes.saveChannel
app.get '/settings/tags', adminOnly, routes.tags