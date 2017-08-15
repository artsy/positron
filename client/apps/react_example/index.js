import 'babel-core/register'
import express from 'express'
import { adminOnly } from 'client/lib/middleware.coffee'
import * as routes from './routes'

const app = module.exports = express()

app.set('view engine', 'jade')
app.set('views', `${__dirname}/components`)

app.get('/react-example', adminOnly, routes.index)
