import express from 'express'
import routes from './routes'
import { setUser, authenticated, adminOnly } from '../users/routes.coffee'

const app = module.exports = express()

app.get('/search', setUser, authenticated, adminOnly, routes.index)
