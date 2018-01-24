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

const onUserJoined = ({io, socket}, data) => {
  console.log(socket.user, data)
}

function addListenersToSocket ({ io, socket }) {
  socket.on('START_EDITING_ARTICLE', onUserJoined.bind(this, {io, socket}))
  socket.on(messageTypes.userJoined, onUserJoined.bind(this, {io, socket}))
}

export const init = (io) =>
  io.on('connection', (socket) => addListenersToSocket({io, socket}))
