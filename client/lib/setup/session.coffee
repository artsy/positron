session = require 'cookie-session'
sharedsession = require 'express-socket.io-session'
{ get } = require 'lodash'

{ SESSION_SECRET } = process.env

sess = exports.defaultSession = session
  secret: SESSION_SECRET
  key: 'positron.sess'

exports.initSocketSession = (app, io) ->
  # copies express sessions to socket-io
  io.use sharedsession(sess)
  
  # saves having to type "socket.request.session.user" everywhere
  io.use (socket, next) ->
    user = get socket, "request.session.user"
    socket.user = user if user
    next()