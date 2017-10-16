import express from 'express'
import { display } from './routes'

const app = module.exports = express()

app.get('/display', display)
