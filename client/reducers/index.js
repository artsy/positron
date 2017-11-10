import app, { initialState as appInitialState } from 'client/reducers/appReducer'
import edit, { initialSTate as editInitialState } from 'client/reducers/editReducer'
import { combineReducers } from 'redux'

export const initialState = {
  ...appInitialState,
  ...editInitialState
}

export default combineReducers({
  app,
  edit
})
