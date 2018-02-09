import {
  sessions,
  getSessionsForChannel,
  onArticlesRequested,
  onUserCurrentlyEditing,
  onUserStartedEditing,
  onUserStoppedEditing
} from '../index'

describe('WebSocket Server', () => {
  let io
  let socket
  let data

  beforeEach(() => {
    io = {
      sockets: {
        emit: jest.fn()
      }
    }

    socket = {
      emit: jest.fn()
    }

    sessions['123456'] = {
      timestamp: '2018-01-30T23:12:20.973Z',
      user: {
        id: '123',
        name: 'John Doe'
      },
      article: '123456',
      channel: {
        id: '1',
        name: 'Artsy Editorial',
        type: 'editorial'
      }
    }
  })

  it('sends articles in session when requested by client', () => {
    const eventType = 'EDITED_ARTICLES_RECEIVED'
    data = getEditingEvent(eventType)
    onArticlesRequested({io, socket}, {channel: data.channel})

    expect(socket.emit.mock.calls.length).toBe(1)
    expect(socket.emit.mock.calls[0][0]).toBe('articlesRequested')
    expect(socket.emit.mock.calls[0][1]).toEqual({
      type: eventType,
      payload: getSessionsForChannel(sessions, data.channel)
    })
  })

  it('broadcasts a message to clients when a user starts editing', () => {
    const eventType = 'START_EDITING_ARTICLE'
    data = getEditingEvent(eventType)
    onUserStartedEditing({io, socket}, data)

    expect(io.sockets.emit.mock.calls.length).toBe(1)
    expect(io.sockets.emit.mock.calls[0][0]).toBe('userStartedEditing')
    expect(io.sockets.emit.mock.calls[0][1]).toEqual({
      type: eventType,
      payload: sessions[data.article]
    })
  })

  it('broadcasts a message to clients when a user stops editing', () => {
    const eventType = 'STOP_EDITING_ARTICLE'
    const event = {
      type: eventType,
      payload: {
        article: data.article
      }
    }
    data = getEditingEvent(eventType)

    expect(sessions[data.article]).not.toBeUndefined()
    onUserStoppedEditing({io, socket}, data)
    expect(io.sockets.emit.mock.calls.length).toBe(1)
    expect(io.sockets.emit.mock.calls[0][0]).toBe('userStoppedEditing')
    expect(io.sockets.emit.mock.calls[0][1]).toEqual(event)
    expect(sessions[data.article]).toBeUndefined()
  })

  it('broadcasts a message when a user is currently editing', () => {
    onUserCurrentlyEditing({io, socket}, data)

    expect(io.sockets.emit.mock.calls[0][0]).toBe('articlesRequested')
    expect(io.sockets.emit.mock.calls[0][1]).toEqual({
      type: 'EDITED_ARTICLES_RECEIVED',
      payload: getSessionsForChannel(sessions, data.channel)
    })
  })
})

let getEditingEvent = (type) => ({
  timestamp: '2018-01-30T23:12:20.973Z',
  user: {
    name: 'John Doe',
    email: 'joe@artsymail.com',
    id: '123',
    current_channel: {
      id: '1',
      name: 'Artsy Editorial',
      type: 'editorial'
    }
  },
  article: '123456',
  type,
  channel: {
    id: '1',
    name: 'Artsy Editorial',
    type: 'editorial'
  }
})
