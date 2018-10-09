import keyMirror from "client/lib/keyMirror"

export const messageTypes = keyMirror(
  "articlesRequested",
  "userStartedEditing",
  "userCurrentlyEditing",
  "userStoppedEditing",
  "articleLocked"
)
