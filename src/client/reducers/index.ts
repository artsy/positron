import {
  appReducer,
  AppState,
  initialState as appInitialState,
} from "client/reducers/appReducer"
import {
  articlesReducer,
  ArticlesState,
  initialState as articlesInitialState,
} from "client/reducers/articlesReducer"
import {
  editReducer,
  EditState,
  initialState as editInitialState,
} from "client/reducers/editReducer"
import { combineReducers } from "redux"

interface GlobalState {
  app: AppState
  edit: EditState
  articlesList: ArticlesState
}

export const initialState: GlobalState = {
  app: appInitialState,
  edit: editInitialState,
  articlesList: articlesInitialState,
}

export const reducers = combineReducers({
  app: appReducer,
  edit: editReducer,
  articlesList: articlesReducer,
})
