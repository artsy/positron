import { appReducer, initialState as appInitialState } from 'client/reducers/appReducer'
import { editReducer, initialState as editInitialState } from 'client/reducers/editReducer'
import { combineReducers } from 'redux'

export const initialState = {
  app: appInitialState,
  edit: editInitialState
}

export const reducers = combineReducers({
  app: appReducer,
  edit: editReducer
})
