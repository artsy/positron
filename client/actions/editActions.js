import keyMirror from 'client/lib/keyMirror'
import { emitAction } from 'client/apps/websocket/client'
import { messageTypes } from 'client/apps/websocket/messageTypes'

export const actions = keyMirror(
  'CHANGE_SAVED_STATUS',
  'CHANGE_VIEW',
  'VIEW_ARTICLES',
  'START_EDITING_ARTICLE',
  'STOP_EDITING_ARTICLE',
  'DELETE_ARTICLE',
  'ERROR',
  'NEW_SECTION',
  'ON_CHANGE_SECTION',
  'PUBLISH_ARTICLE',
  'REMOVE_SECTION',
  'SAVE_ARTICLE',
  'SET_SECTION'
)

export const changeSavedStatus = (article, isSaved) => ({
  type: actions.CHANGE_SAVED_STATUS,
  payload: {
    article,
    isSaved,
    lastUpdated: new Date()
  }
})

export const changeView = (activeView) => ({
  // Content, Admin, Display
  type: actions.CHANGE_VIEW,
  payload: {
    activeView
  }
})

export const viewArticles = emitAction(() => ({
  type: actions.VIEW_ARTICLES,
  key: messageTypes.articlesRequested,
  payload: {
    timestamp: new Date().toISOString()
  }
}))

export const deleteArticle = (article) => {
  article.destroy({
    success: () => {
      article.trigger('finished')
    }
  })

  return {
    type: actions.DELETE_ARTICLE,
    payload: {
      isDeleting: true
    }
  }
}

export const startEditingArticle = emitAction((data) => {
  return {
    type: actions.START_EDITING_ARTICLE,
    key: messageTypes.userStartedEditing,
    payload: {
      timestamp: new Date().toISOString(),
      ...data
    }
  }
})

export const stopEditingArticle = emitAction((data) => {
  return {
    type: actions.STOP_EDITING_ARTICLE,
    key: messageTypes.userStoppedEditing,
    payload: {
      timestamp: new Date().toISOString(),
      ...data
    }
  }
})

export const setSection = (sectionIndex) => ({
  // Index of article section currently editing
  type: actions.SET_SECTION,
  payload: {
    sectionIndex
  }
})

export const newSection = (type, sectionIndex) => {
  const section = setupSection(type)

  return {
    type: actions.NEW_SECTION,
    payload: {
      section,
      sectionIndex
    }
  }
}

export const onChangeSection = (key, value) => {
  return {
    type: actions.ON_CHANGE_SECTION,
    payload: {
      key,
      value
    }
  }
}

export const publishArticle = (article, published) => {
  article.set('published', published)
  article.save()
  article.trigger('finished')

  return {
    type: actions.PUBLISH_ARTICLE,
    payload: {
      isPublishing: true
    }
  }
}

export const removeSection = (sectionIndex) => ({
  type: actions.REMOVE_SECTION,
  payload: {
    sectionIndex
  }
})

export const saveArticle = (article) => {
  article.save()

  return {
    type: actions.SAVE_ARTICLE,
    payload: {
      isSaving: true
    }
  }
}

// EDITING ERRORS
export const logError = (error) => ({
  type: actions.ERROR,
  payload: {
    error
  }
})

export const resetError = () => ({
  type: actions.ERROR,
  payload: {
    error: null
  }
})

// ACTION UTILS
export function setupSection (type) {
  // set initial state of new section
  switch (type) {
    case 'video':
      return {
        type: 'video',
        url: '',
        layout: 'column_width'
      }
    case 'image_collection':
      return {
        type: 'image_collection',
        layout: 'overflow_fillwidth',
        images: []
      }
    case 'embed':
      return {
        type: 'embed',
        url: '',
        layout: 'column_width',
        height: ''
      }
    case 'text':
      return {
        type: 'text',
        body: ''
      }
  }
}
