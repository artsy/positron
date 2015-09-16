#
# CRUD for sections.
#

express = require 'express'
routes = require './routes'

app = module.exports = express()
app.set 'views', __dirname
app.set 'view engine', 'jade'

app.get '/sections', routes.index
app.get '/sections/:id/edit', routes.edit
app.get '/sections/new', routes.edit
app.post '/sections/:id', routes.save
app.post '/sections', routes.save