import get from 'lodash.get'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import createDebounce from 'redux-debounce'
import { compose, createStore, applyMiddleware } from 'redux'
import { contains } from 'underscore'
import { data as sd } from 'sharify'

export function createReduxStore (rootReducer, initialState = {}) {
  const isDevelopment = contains(['development', 'staging'], sd.NODE_ENV)
  let composeEnhancers = compose

  const debounceConfig = {
    simple: 300
  }
  const debounceMiddleware = createDebounce(debounceConfig)

  const middleware = [
    thunkMiddleware,
    debounceMiddleware
  ]

  if (isDevelopment) {
    middleware.push(
      // Must come last in middleware chain
      createLogger({
        collapsed: true
      })
    )

    /**
     * Connect to Chrome DevTools extension if available.
     * See: http://zalmoxisus.github.io/redux-devtools-extension/
     */
    composeEnhancers = get(window, '__REDUX_DEVTOOLS_EXTENSION_COMPOSE__', compose)
  }

  const store = createStore(
    rootReducer,
    initialState,
    composeEnhancers(applyMiddleware(...middleware))
  )

  return store
}
