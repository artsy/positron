#
# CRUD for brand partners.
#

express = require 'express'
routes = require './routes'

app = module.exports = express()
app.set 'views', __dirname
app.set 'view engine', 'jade'

app.get '/brand-partners', routes.index
app.get '/brand-partners/:id/edit', routes.edit
app.get '/brand-partners/new', routes.edit
app.post '/brand-partners/:id', routes.save
app.post '/brand-partners', routes.save