import express from 'express'

const app = module.exports = express.Router()

app.get('/foo', (req, res, next) => {
  res.send('working! 33')
})
