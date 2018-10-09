import { messageTypes } from "./messageTypes"
import Session from "client/models/session"
import Sessions from "client/collections/sessions"

const {
  articlesRequested,
  articleLocked,
  userStartedEditing,
  userStoppedEditing,
  userCurrentlyEditing,
} = messageTypes

export let sessions = new Sessions()

export const getSessionsForChannel = (channel, callback) => {
  return sessions.fetch().then(data => {
    const filteredSessions = {}

    for (let session of data) {
      session.id = session._id
      if (channel.id === session.channel.id) {
        filteredSessions[session.id] = session
      }
    }

    if (callback) {
      callback(filteredSessions)
    }
    return filteredSessions
  })
}

export const onArticlesRequested = ({ io, socket }, { channel }) => {
  console.log("[socket] onArticlesRequested, channel id: ", channel.id)
  const event = articlesRequested

  return getSessionsForChannel(channel).then(sessions => {
    socket.emit(event, {
      type: "EDITED_ARTICLES_RECEIVED",
      payload: sessions,
    })
    return sessions
  })
}

export const onUserStartedEditing = ({ io, socket }, data) => {
  console.log(
    "[socket] onUserStartedEditing, userId: ",
    data.user.id,
    ", article: ",
    data.article
  )
  const { channel, timestamp, user, article } = data
  const { id, name } = user

  return getSessionsForChannel(channel).then(sessions => {
    const currentSession = sessions[article]
    if (currentSession && currentSession.user.id !== id) {
      socket.emit(articleLocked, {
        type: "ARTICLE_LOCKED",
        payload: sessions[article],
      })
      return
    }

    const newSession = {
      id: article,
      timestamp,
      user: {
        id,
        name,
      },
      article,
      channel,
    }

    const model = new Session(newSession)
    model.save()

    io.sockets.emit(userStartedEditing, {
      type: data.type,
      payload: newSession,
    })

    return newSession
  })
}

export const onUserCurrentlyEditing = ({ io, socket }, data) => {
  const { article, timestamp } = data
  return getSessionsForChannel(data.channel).then(sessions => {
    if (!sessions[article]) {
      return
    }
    sessions[article].timestamp = timestamp
    new Session(sessions[article]).save()
    const event = articlesRequested

    return io.sockets.emit(event, {
      type: "EDITED_ARTICLES_RECEIVED",
      payload: sessions[article],
    })
  })
}

export const onUserStoppedEditing = ({ io, socket }, data) => {
  console.log(
    "[socket] onUserStoppedEditing, userId: ",
    data.user.id,
    ", article: ",
    data.article
  )
  const { article, user } = data

  return getSessionsForChannel(data.channel).then(sessions => {
    const currentSession = sessions[article]

    if (currentSession && currentSession.user.id !== user.id) {
      socket.emit(articleLocked, {
        type: "ARTICLE_LOCKED",
        payload: sessions[article],
      })
      return
    }

    return new Session(currentSession).destroy({
      success: () => {
        io.sockets.emit(userStoppedEditing, {
          type: data.type,
          payload: {
            article,
          },
        })
      },
    })
  })
}

function addListenersToSocket({ io, socket }) {
  socket.on(articlesRequested, onArticlesRequested.bind(this, { io, socket }))
  socket.on(userStartedEditing, onUserStartedEditing.bind(this, { io, socket }))
  socket.on(userStoppedEditing, onUserStoppedEditing.bind(this, { io, socket }))
  socket.on(
    userCurrentlyEditing,
    onUserCurrentlyEditing.bind(this, { io, socket })
  )
}

export const init = io => {
  io.on("connection", socket => addListenersToSocket({ io, socket }))
}
