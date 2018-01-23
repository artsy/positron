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

const onUserJoined = ({io, socket}) => {
  console.log(socket.user)
}

function addListenersToSocket ({ io, socket }) {
  socket.on(messageTypes.userJoined, onUserJoined.bind(this, {io, socket}))
}

export const init = (io) =>
  io.on('connection', (socket) => addListenersToSocket({io, socket}))
