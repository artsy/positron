import { messageTypes } from './messageTypes'
import { actions } from 'client/actions/articlesActions'

const {
  articlesRequested,
  articleLocked,
  userStartedEditing
} = messageTypes

export const articlesInSession = {}

const onArticlesRequested = ({io, socket}) => {
  console.log('onArticlesRequested')
  const event = articlesRequested
  socket.emit(event, {
    type: actions.EDITED_ARTICLES_RECEIVED,
    payload: articlesInSession
  })
}

const onUserStartedEditing = ({io, socket}, data) => {
  console.log('onUserStartedEditing', data)
  const { timestamp, user, article } = data
  const { id, name } = user
  const currentSession = articlesInSession[data.article]
  if (currentSession && currentSession.user.id !== id) {
    socket.emit(articleLocked, articlesInSession[data.article])
    return
  }

  const newSession = articlesInSession[data.article] = {
    timestamp,
    user: {
      id,
      name
    },
    article
  }

  io.sockets.emit(userStartedEditing, {
    type: data.type,
    payload: newSession
  })
}

function addListenersToSocket ({ io, socket }) {
  socket.on(messageTypes.articlesRequested, onArticlesRequested.bind(this, {io, socket}))
  socket.on(messageTypes.userStartedEditing, onUserStartedEditing.bind(this, {io, socket}))
}

export const init = (io) => {
  io.on('connection', (socket) => addListenersToSocket({io, socket}))
}
