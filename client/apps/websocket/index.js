import { messageTypes } from './messageTypes'

const {
  articlesRequested,
  articleLocked,
  userStartedEditing
} = messageTypes

const articlesEdited = {}

const onArticlesRequested = ({io, socket}) => {
  console.log('onArticlesRequested')
  const event = articlesRequested
  socket.emit(event, articlesEdited)
}

const onUserJoined = ({io, socket}, data) => {
  console.log(socket.user, data)
}

const onUserStartedEditing = ({io, socket}, data) => {
  console.log(data)
  const { timestamp, user, article } = data
  const { id, name } = user

  if (articlesEdited[data.article]) {
    socket.emit(articleLocked, articlesEdited[data.article])
    return
  }

  const event = articlesEdited[data.article] = {
    timestamp,
    user: {
      id,
      name
    },
    article
  }

  io.sockets.emit(userStartedEditing, event)
}

function addListenersToSocket ({ io, socket }) {
  socket.on(messageTypes.articlesRequested, onArticlesRequested.bind(this, {io, socket}))
  socket.on(messageTypes.userJoined, onUserJoined.bind(this, {io, socket}))
  socket.on(messageTypes.onUserStartedEditing, onUserStartedEditing.bind(this, {io, socket}))
}

export const init = (io) =>
  io.on('connection', (socket) => addListenersToSocket({io, socket}))
