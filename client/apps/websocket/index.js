import { messageTypes } from './messageTypes'
import { filter } from 'lodash'

const {
  articlesRequested,
  articleLocked,
  userStartedEditing,
  userStoppedEditing,
  userCurrentlyEditing
} = messageTypes

export const sessions = {}

export const getSessionsForChannel = (channel) => {
  return filter(sessions, s => s.channel.id === channel.id)
}

export const onArticlesRequested = ({io, socket}, { channel }) => {
  console.log('[socket] onArticlesRequested, channel id: ', channel.id)
  const event = articlesRequested

  socket.emit(event, {
    type: 'EDITED_ARTICLES_RECEIVED',
    payload: getSessionsForChannel(sessions, channel)
  })
}

export const onUserStartedEditing = ({io, socket}, data) => {
  console.log('[socket] onUserStartedEditing, userId: ', data.user.id, ', article: ', data.article)
  const { channel, timestamp, user, article } = data
  const { id, name } = user
  const currentSession = sessions[article]
  if (currentSession && currentSession.user.id !== id) {
    socket.emit(articleLocked, {
      type: 'ARTICLE_LOCKED',
      payload: sessions[article]
    })
    return
  }

  const newSession = sessions[article] = {
    timestamp,
    user: {
      id,
      name
    },
    article,
    channel
  }

  io.sockets.emit(userStartedEditing, {
    type: data.type,
    payload: newSession
  })
}

export const onUserCurrentlyEditing = ({io, socket}, data) => {
  const { article, timestamp } = data
  sessions[article].timestamp = timestamp

  const event = articlesRequested
  io.sockets.emit(event, {
    type: 'EDITED_ARTICLES_RECEIVED',
    payload: getSessionsForChannel(sessions, data.channel)
  })
}

export const onUserStoppedEditing = ({io, socket}, data) => {
  console.log('[socket] onUserStoppedEditing, userId: ', data.user.id, ', article: ', data.article)
  const { article, user } = data
  const currentSession = sessions[article]

  if (currentSession && currentSession.user.id !== user.id) {
    socket.emit(articleLocked, {
      type: 'ARTICLE_LOCKED',
      payload: sessions[article]
    })
    return
  }
  delete sessions[article]

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
