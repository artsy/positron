import {
  getSessionsForChannel,
  onArticlesRequested,
  onUserCurrentlyEditing,
  onUserStartedEditing,
  onUserStoppedEditing,
} from "../index"

import Sessions from "client/collections/sessions"

describe("WebSocket Server", () => {
  let io
  let socket
  let data

  beforeEach(() => {
    io = {
      sockets: {
        emit: jest.fn(),
      },
    }

    socket = {
      emit: jest.fn(),
    }

    Sessions.prototype.fetch = fetch
  })

  it("should return a filtered list by channels", () => {
    return getSessionsForChannel({ id: "2" }).then(sessions => {
      return expect(sessions).toEqual({
        "246810": {
          _id: 246810,
          id: 246810,
          timestamp: "2018-01-30T23:12:20.973Z",
          user: {
            id: "124",
            name: "Ellen Poe",
          },
          article: "246810",
          channel: {
            id: "2",
            name: "Other Editors",
            type: "editorial",
          },
        },
      })
    })
  })

  it("sends articles in session when requested by client", () => {
    const eventType = "EDITED_ARTICLES_RECEIVED"
    data = getEditingEvent(eventType)
    return onArticlesRequested({ io, socket }, { channel: data.channel }).then(
      sessions => {
        expect(socket.emit.mock.calls.length).toBe(1)
        expect(socket.emit.mock.calls[0][0]).toBe("articlesRequested")
        return expect(socket.emit.mock.calls[0][1]).toEqual({
          type: eventType,
          payload: sessions,
        })
      }
    )
  })

  it("does not broadcast an update for #userCurrentlyEditing if the session is invalid", () => {
    return onUserCurrentlyEditing(
      { io, socket },
      {
        timestamp: new Date().toISOString(),
        article: "-1",
        channel: {
          id: "1",
        },
      }
    ).then(() => {
      return expect(io.sockets.emit.mock.calls.length).toBe(0)
    })
  })

  it("broadcasts a message to clients when a user starts editing", () => {
    const eventType = "START_EDITING_ARTICLE"
    data = getEditingEvent(eventType)
    return onUserStartedEditing({ io, socket }, data).then(session => {
      expect(io.sockets.emit.mock.calls.length).toBe(1)
      expect(io.sockets.emit.mock.calls[0][0]).toBe("userStartedEditing")
      return expect(io.sockets.emit.mock.calls[0][1]).toEqual({
        type: eventType,
        payload: session,
      })
    })
  })

  it("broadcasts a message to clients when a user stops editing", () => {
    const eventType = "STOP_EDITING_ARTICLE"
    const event = {
      type: eventType,
      payload: {
        article: data.article,
      },
    }
    data = getEditingEvent(eventType)

    return getSessionsForChannel(data.channel, sessions => {
      expect(sessions[data.article]).not.toBeUndefined()
      return onUserStoppedEditing({ io, socket }, data).then(() => {
        expect(io.sockets.emit.mock.calls.length).toBe(1)
        expect(io.sockets.emit.mock.calls[0][0]).toBe("userStoppedEditing")
        expect(io.sockets.emit.mock.calls[0][1]).toEqual(event)
        return expect(sessions[data.article]).toBeUndefined()
      })
    })
  })

  it("broadcasts a message when a user is currently editing", () => {
    onUserCurrentlyEditing({ io, socket }, data).then(() => {
      expect(io.sockets.emit.mock.calls[0][0]).toBe("articlesRequested")
      expect(io.sockets.emit.mock.calls[0][1]).toEqual({
        type: "EDITED_ARTICLES_RECEIVED",
        payload: fetch().resolve()[0],
      })
    })
  })
})

const getEditingEvent = type => ({
  timestamp: "2018-01-30T23:12:20.973Z",
  user: {
    name: "John Doe",
    email: "joe@artsymail.com",
    id: "123",
    current_channel: {
      id: "1",
      name: "Artsy Editorial",
      type: "editorial",
    },
  },
  article: "123456",
  type,
  channel: {
    id: "1",
    name: "Artsy Editorial",
    type: "editorial",
  },
})

function fetch() {
  return new Promise(resolve => {
    resolve([
      {
        _id: 123456,
        timestamp: "2018-01-30T23:12:20.973Z",
        user: {
          id: "123",
          name: "John Doe",
        },
        article: "123456",
        channel: {
          id: "1",
          name: "Artsy Editorial",
          type: "editorial",
        },
      },
      {
        _id: 246810,
        timestamp: "2018-01-30T23:12:20.973Z",
        user: {
          id: "124",
          name: "Ellen Poe",
        },
        article: "246810",
        channel: {
          id: "2",
          name: "Other Editors",
          type: "editorial",
        },
      },
    ])
  })
}
