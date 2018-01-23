import io from 'socket.io-client'

const sd = require('sharify').data

const socket = io(sd.APP_URL)
console.log(socket, sd.APP_URL)

const messageTypes = [
  'userJoined',
  'userLeft',
  'usersRequested',
  'userStartedEditing',
  'userStoppedEditing',
  'articleAdded',
  'articleDeleted'
].reduce((accum, msg) => {
  accum[ msg ] = msg
  return accum
}, {})

const init = (store) => {
  // add listeners to socket messages so we can re-dispatch them as actions
  Object.keys(messageTypes)
    .forEach(type => socket.on(type, (payload) => store.dispatch({ type, payload })))
}

const emit = (type, payload) => socket.emit(type, payload)

const emitAction = (action) => {
  return (...args) => {
    const result = action.apply(this, args)
    socket.emit(result.type, result.payload)
    return result
  }
}

export {
  init,
  emit,
  emitAction
}
