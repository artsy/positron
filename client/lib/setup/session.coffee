session = require 'cookie-session'

{ SESSION_SECRET } = process.env

module.exports = (app, io) ->
  console.log "Setting up session"
  
  sess = session
    secret: SESSION_SECRET
    key: 'positron.sess'
  app.use sess

  # copies express sessions to socket-io
  io.use (socket, next) ->
    sess socket.request, socket.request.res, next
  
  # saves having to type "socket.request.session.user" everywhere
  io.use (socket, next) ->
    user = _.get(socket, 'request.session.user')
    if user
      socket.user = user
    next()