import express from 'express'
import { index, saveSession, deleteSession } from './routes'
// import { setUser, authenticated, adminOnly } from '../users/routes'

const app = module.exports = express()

app.get('/sessions', index)
app.post('/sessions', saveSession)
app.delete('/sessions/:id', deleteSession)
