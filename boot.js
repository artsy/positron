/**
 * Main server that combines API & client
 */

import artsyXapp from 'artsy-xapp'
import express from 'express'
import newrelic from 'artsy-newrelic'
import path from 'path'
import { IpFilter } from 'express-ipfilter'
import { createReloadable, isDevelopment } from 'lib/reloadable'

const debug = require('debug')('app')
const app = module.exports = express()

// Blacklist ips
app.use(
  IpFilter([process.env.IP_BLACKLIST.split(',')], { log: false, mode: 'deny' })
)

// Get an xapp token
const xappConfig = {
  url: process.env.ARTSY_URL,
  id: process.env.ARTSY_ID,
  secret: process.env.ARTSY_SECRET
}

artsyXapp.init(xappConfig, () => {
  app.use(newrelic)

  if (isDevelopment) {
    const reloadAndMount = createReloadable(app)

    // Enable server-side code hot-swapping on change
    app.use('/api', reloadAndMount(path.resolve(__dirname, 'api'), {
      mountPoint: '/api'
    }))

    invalidateUserMiddleware(app)
    reloadAndMount(path.resolve(__dirname, 'client'))

    // Staging, Prod
  } else {
    app.use('/api', require('./api'))
    invalidateUserMiddleware(app)
    app.use(require('./client'))
  }

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

const invalidateUserMiddleware = (app) => {
  app.use((req, rest, next) => {
    req.user = null
    next()
  })
}
