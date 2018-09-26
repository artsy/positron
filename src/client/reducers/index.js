import {
  appReducer,
  initialState as appInitialState,
} from "client/reducers/appReducer"
import {
  editReducer,
  initialState as editInitialState,
} from "client/reducers/editReducer"
import {
  articlesReducer,
  initialState as articlesInitialState,
} from "client/reducers/articlesReducer"
import { combineReducers } from "redux"

export const initialState = {
  app: appInitialState,
  edit: editInitialState,
  articlesList: articlesInitialState,
}

export const reducers = combineReducers({
  app: appReducer,
  edit: editReducer,
  articlesList: articlesReducer,
})
