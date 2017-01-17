#
# List views for list
#

express = require 'express'
routes = require './routes'

app = module.exports = express()
app.set 'views', __dirname
app.set 'view engine', 'jade'

app.get '/', (req, res) -> res.redirect '/articles'
# app.get '/list', routes.articles_list

app.get '/articles', routes.articles_list
