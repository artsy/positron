/**
 * Main server that combines API & client
 */

import artsyXapp from 'artsy-xapp'
import express from 'express'
import { IpFilter } from 'express-ipfilter'
import newrelic from 'artsy-newrelic'

const debug = require('debug')('app')
const app = module.exports = express()

// Blacklist ips
app.use(
  IpFilter([process.env.IP_BLACKLIST.split(',')], { log: false, mode: 'deny' })
)

// Get an xapp token
artsyXapp.init({
  url: process.env.ARTSY_URL,
  id: process.env.ARTSY_ID,
  secret: process.env.ARTSY_SECRET
}, () => {
  app.use(newrelic)

  // Put client/api together
  app.use('/api', require('./api'))

  // TODO: Possibly a terrible hack to not share `req.user` between both.
  app.use((req, rest, next) => {
    req.user = null
    next()
  })

  app.use(require('./client'))

  // Start the server and send a message to IPC for the integration test
  // helper to hook into.
  app.listen(process.env.PORT, () => {
    debug(`Listening on port ${process.env.PORT}`)

    if (typeof process.send === 'function') {
      process.send('listening')
    }
  })
})

// Crash if we can't get/refresh an xapp token
artsyXapp.on('error', (error) => {
  console.warn(error)
  process.exit(1)
})
