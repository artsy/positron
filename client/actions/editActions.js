import keyMirror from 'client/lib/keyMirror'

export const actions = keyMirror(
  'EDIT'
)

export const edit = (id) => ({
  type: actions.EDIT,
  payload: {
    id
  }
})
