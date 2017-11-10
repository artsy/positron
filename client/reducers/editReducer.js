import u from 'updeep'
import { actions } from 'client/actions/editActions'

export default function editReducer (action, state) {
  switch (action.type) {
    case actions.EDIT: {
      return u({
        isEditing: action.payload.isEditing
      }, state)
    }
  }
}
