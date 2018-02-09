import { clone, extend } from 'lodash'
import keyMirror from 'client/lib/keyMirror'
import Article from 'client/models/article.coffee'
import { emitAction } from 'client/apps/websocket/client'
import { messageTypes } from 'client/apps/websocket/messageTypes'
import $ from 'jquery'

export const actions = keyMirror(
  'CHANGE_SAVED_STATUS',
  'CHANGE_VIEW',
  'CHANGE_SECTION',
  'CHANGE_ARTICLE',
  'START_EDITING_ARTICLE',
  'UPDATE_ARTICLE',
  'STOP_EDITING_ARTICLE',
  'DELETE_ARTICLE',
  'ERROR',
  'NEW_SECTION',
  'ON_CHANGE_ARTICLE',
  'ON_CHANGE_SECTION',
  'ON_FIRST_SAVE',
  'PUBLISH_ARTICLE',
  'REDIRECT_TO_LIST',
  'REMOVE_SECTION',
  'RESET_SECTIONS',
  'SAVE_ARTICLE',
  'SET_SECTION',
  'SET_SEO_KEYWORD',
  'TOGGLE_SPINNER'
)

export const changeSavedStatus = (article, isSaved) => {
  return {
    type: actions.CHANGE_SAVED_STATUS,
    payload: {
      article,
      isSaved,
      lastUpdated: new Date()
    }
  }
}

export const changeView = (activeView) => ({
  // Content, Admin, Display
  type: actions.CHANGE_VIEW,
  payload: {
    activeView
  }
})

export const deleteArticle = (key, value) => {
  return (dispatch, getState) => {
    const { article } = getState().edit
    const newArticle = new Article(article)

    dispatch(deleteArticlePending())
    newArticle.destroy({
      success: () => {
        dispatch(redirectToList(true))
      }
    })
  }
}

export const deleteArticlePending = () => {
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

export const updateArticle = emitAction((data) => {
  return {
    type: actions.UPDATE_ARTICLE,
    key: messageTypes.userCurrentlyEditing,
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

export const newSection = (type, sectionIndex, attrs = {}) => {
  const section = extend(setupSection(type), attrs)

  return {
    type: actions.NEW_SECTION,
    payload: {
      section,
      sectionIndex
    }
  }
}

export const newHeroSection = (type) => {
  const section = setupSection(type)

  return (dispatch, getState) => {
    dispatch(changeArticle('hero_section', section))
  }
}

export const onChangeArticle = (key, value) => {
  return (dispatch, getState) => {
    const { article } = getState().edit

    dispatch(changeArticle(key, value))

    if (!article.published) {
      dispatch(saveArticle())
    }
  }
}

export const changeArticle = (key, value) => {
  return {
    type: actions.CHANGE_ARTICLE,
    payload: {
      key,
      value
    }
  }
}

export const onChangeHero = (key, value) => {
  return (dispatch, getState) => {
    const { article } = getState().edit
    const hero_section = clone(article.hero_section)

    hero_section[key] = value
    dispatch(changeArticle('hero_section', hero_section))

    if (!article.published) {
      dispatch(saveArticle())
    }
  }
}

export const onChangeSection = (key, value) => {
  return (dispatch, getState) => {
    const { article } = getState().edit

    dispatch(changeSection(key, value))

    if (!article.published) {
      dispatch(saveArticle())
    }
  }
}

export const changeSection = (key, value) => {
  return {
    type: actions.CHANGE_SECTION,
    payload: {
      key,
      value
    }
  }
}

export const onFirstSave = (id) => {
  window.location.assign(`/articles/${id}/edit`)

  return {
    type: actions.ON_FIRST_SAVE
  }
}

export const publishArticle = () => {
  return (dispatch, getState) => {
    dispatch(publishArticlePending())
    const { article } = getState().edit
    const published = !article.published
    const newArticle = new Article(article)

    newArticle.set({ published })
    if (published) {
      dispatch(setSeoKeyword(newArticle))
    }
    newArticle.save()

    dispatch(redirectToList(published))
  }
}

export const publishArticlePending = () => {
  return {
    type: actions.PUBLISH_ARTICLE,
    payload: {
      isPublishing: true
    }
  }
}

export const redirectToList = (published) => {
  window.location.assign(`/articles?published=${published}`)

  return {
    type: actions.REDIRECT_TO_LIST
  }
}

export const removeSection = (sectionIndex) => ({
  type: actions.REMOVE_SECTION,
  payload: {
    sectionIndex
  }
})

export const resetSections = (sections) => {
  return (dispatch, getState) => {
    const { article } = getState().edit
    const newArticle = extend(article, { sections })

    dispatch(onResetSections(newArticle))
  }
}

export const onResetSections = (article) => ({
  type: actions.RESET_SECTIONS,
  payload: {
    article
  }
})

export const saveArticle = () => {
  return (dispatch, getState) => {
    const { article } = getState().edit
    const newArticle = new Article(article)

    dispatch(saveArticlePending())

    newArticle.on('sync', () => {
      dispatch(changeSavedStatus(article, true))
    })

    dispatch(setSeoKeyword(newArticle))
    newArticle.save()

    if (article.published) {
      dispatch(redirectToList(true))
    }
  }
}

export const saveArticlePending = () => {
  return {
    type: actions.SAVE_ARTICLE,
    payload: {
      isSaving: true
    }
  }
}

export const toggleSpinner = (isVisible) => {
  if (isVisible) {
    $('#edit-sections-spinner').show()
  } else {
    $('#edit-sections-spinner').hide()
  }

  return {
    type: actions.TOGGLE_SPINNER
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
    case 'blockquote':
      return {
        type: 'text',
        body: '',
        layout: 'blockquote'
      }
  }
}

export const setSeoKeyword = (article) => {
  if (article.get('published')) {
    const seo_keyword = $('input#edit-seo__focus-keyword').val() || ''

    article.set({ seo_keyword })
  }
  return {
    type: actions.SET_SEO_KEYWORD
  }
}
