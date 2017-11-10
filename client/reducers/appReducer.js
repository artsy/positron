import u from 'updeep'
import { actions } from 'client/actions/appActions'

export default function editReducer (action, state) {
  switch (action.type) {
    case actions.LOGIN: {
      return u({
        isLoggedIn: true
      }, state)
    }
    case actions.LOGOUT: {
      return u({
        isLoggedIn: false
      }, state)
    }
  }
}
