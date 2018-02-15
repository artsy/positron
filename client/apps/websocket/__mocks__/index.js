export const {
  getSessionsForChannel,
  onArticlesRequested,
  onUserStartedEditing,
  onUserCurrentlyEditing,
  onUserStoppedEditing,
  init
} = require.requireActual('../index')

export const sessions = {
  fetch: () => {
    return new Promise((resolve) => {
      resolve({
        123456: {
          _id: 123456,
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
        },
        246810: {
          _id: 246810,
          timestamp: '2018-01-30T23:12:20.973Z',
          user: {
            id: '124',
            name: 'Ellen Poe'
          },
          article: '246810',
          channel: {
            id: '2',
            name: 'Other Editors',
            type: 'editorial'
          }
        }
      })
    })
  }
}
