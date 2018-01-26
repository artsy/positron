import keyMirror from 'client/lib/keyMirror'

export const messageTypes = keyMirror(
  'userJoined',
  'userLeft',
  'articlesRequested',
  'userStartedEditing',
  'userCurrentlyEditing',
  'userStoppedEditing',
  'articleAdded',
  'articleLocked',
  'articleDeleted'
)
