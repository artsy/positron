import keyMirror from 'client/lib/keyMirror'

export const actions = keyMirror(
  'EDIT'
)

export const edit = (isEditing) => ({
  type: actions.EDIT,
  payload: {
    isEditing
  }
})
