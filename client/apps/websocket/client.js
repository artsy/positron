import io from 'socket.io-client'
import { messageTypes } from './messageTypes'

const sd = require('sharify').data
const socket = io(sd.APP_URL)

const init = (store) => {
  // add listeners to socket messages so we can re-dispatch them as actions
  Object
    .keys(messageTypes)
    .forEach(type =>
      socket.on(type, (payload) => store.dispatch({ type, payload }))
    )
}

const emit = (type, payload) => socket.emit(type, payload)

// Helper to emit a redux action to our websocket server
const emitAction = (action) => {
  return (...args) => {
    const result = action.apply(this, args)
    socket.emit(result.key, result.payload)
    return result
  }
}

export {
  init,
  emit,
  emitAction
}
