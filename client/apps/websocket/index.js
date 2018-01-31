import { messageTypes } from './messageTypes'
import { actions } from 'client/actions/articlesActions'

const {
  articlesRequested,
  articleLocked,
  userStartedEditing,
  userStoppedEditing,
  userCurrentlyEditing
} = messageTypes

export const articlesInSession = {}

export const onArticlesRequested = ({io, socket}) => {
  console.log('[socket] onArticlesRequested')
  const event = articlesRequested
  socket.emit(event, {
    type: actions.EDITED_ARTICLES_RECEIVED,
    payload: articlesInSession
  })
}

export const onUserStartedEditing = ({io, socket}, data) => {
  console.log('[socket] onUserStartedEditing, userId: ', data.user.id, ', article: ', data.article)
  const { timestamp, user, article } = data
  const { id, name } = user
  const currentSession = articlesInSession[article]
  if (currentSession && currentSession.user.id !== id) {
    socket.emit(articleLocked, articlesInSession[article])
    return
  }

  const newSession = articlesInSession[article] = {
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

export const onUserCurrentlyEditing = ({io, socket}, data) => {
  const { article, timestamp } = data
  articlesInSession[article].timestamp = timestamp

  const event = articlesRequested
  io.sockets.emit(event, {
    type: actions.EDITED_ARTICLES_RECEIVED,
    payload: articlesInSession
  })
}

export const onUserStoppedEditing = ({io, socket}, data) => {
  console.log('[socket] onUserStoppedEditing, userId: ', data.user.id, ', article: ', data.article)
  const { article, user } = data
  const currentSession = articlesInSession[article]

  if (currentSession && currentSession.user.id !== user.id) {
    socket.emit(articleLocked, articlesInSession[article])
    return
  }
  delete articlesInSession[article]

  io.sockets.emit(userStoppedEditing, {
    type: data.type,
    payload: {
      article
    }
  })
}

function addListenersToSocket ({ io, socket }) {
  socket.on(articlesRequested, onArticlesRequested.bind(this, {io, socket}))
  socket.on(userStartedEditing, onUserStartedEditing.bind(this, {io, socket}))
  socket.on(userStoppedEditing, onUserStoppedEditing.bind(this, {io, socket}))
  socket.on(userCurrentlyEditing, onUserCurrentlyEditing.bind(this, {io, socket}))
}

export const init = (io) => {
  io.on('connection', (socket) => addListenersToSocket({io, socket}))
}
