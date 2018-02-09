/**
 * Main server that combines API & client
 */

import artsyXapp from 'artsy-xapp'
import express from 'express'
import newrelic from 'artsy-newrelic'
import { IpFilter } from 'express-ipfilter'
import { createReloadable, isDevelopment } from '@artsy/express-reloadable'

const app = module.exports = express()
const debug = require('debug')('app')
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const {
  ARTSY_URL,
  ARTSY_ID,
  ARTSY_SECRET,
  IP_BLACKLIST = '',
  PORT
} = process.env

// Blacklist ips
app.use(
  IpFilter([IP_BLACKLIST.split(',')], { log: false, mode: 'deny' })
)

// Get an xapp token
const xappConfig = {
  url: ARTSY_URL,
  id: ARTSY_ID,
  secret: ARTSY_SECRET
}

artsyXapp.init(xappConfig, () => {
  app.use(newrelic)

  if (isDevelopment) {
    app.use(require('./client/lib/webpack-dev-server'))

    // Enable server-side code hot-swapping on change
    const mountAndReload = createReloadable(app, require)

    app.use('/api', mountAndReload('./api', {
      mountPoint: '/api'
    }))

    invalidateUserMiddleware(app)

    mountAndReload('./client', {
      watchModules: [
        '@artsy/reaction-force'
      ]
    })

    // Staging, Prod
  } else {
    app.use('/api', require('./api'))
    invalidateUserMiddleware(app)
    app.use(require('./client'))
  }

  require('./client/apps/websocket').init(io)
  require('./client/lib/setup/session').initSocketSession(app, io)

  // Start the server and send a message to IPC for the integration test
  // helper to hook into.
  server.listen(PORT, () => {
    debug(`Listening on port ${PORT}`)

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
