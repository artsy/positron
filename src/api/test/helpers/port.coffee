net = require 'net'

basePort = 5000
currentPort = basePort

getTestPort = ->
  currentPort++

isPortAvailable = (port, callback) ->
  server = net.createServer()
  
  server.listen port, ->
    server.once 'close', ->
      callback(null, true)
    server.close()
  
  server.on 'error', (err) ->
    if err.code == 'EADDRINUSE'
      callback(null, false)
    else
      callback(err)

@getAvailablePort = (callback) ->
  tryPort = (port) ->
    isPortAvailable port, (err, available) ->
      if err
        callback(err)
      else if available
        callback(null, port)
      else
        tryPort(port + 1)
  
  tryPort(getTestPort())