#
# Allows an admin to add and remove users from Writer
#

express = require 'express'
routes = require './routes'

app = module.exports = express()
app.set 'views', __dirname
app.set 'view engine', 'jade'

app.get '/contributors', routes.index