import express from 'express'

const app = module.exports = express()

app.get('/bar', (req, res, next) => {
  res.send('working! 41')
})
