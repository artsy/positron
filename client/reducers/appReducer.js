import u from 'updeep'
import { actions } from 'client/actions/appActions'

export const initialState = {
  isLoggedIn: false,
  status: ''
}

export function appReducer (state = initialState, action) {
  switch (action.type) {
    case actions.HELLO_WORLD: {
      return u({
        status: action.payload.status
      }, state)
    }
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

  return state
}
