import keyMirror from 'client/lib/keyMirror'

export const actions = keyMirror(
  'CHANGE_SAVED_STATUS',
  'CHANGE_SECTION',
  'CHANGE_VIEW',
  'DELETE_ARTICLE',
  'ERROR',
  'PUBLISH_ARTICLE',
  'SAVE_ARTICLE'
)

export const changeSavedStatus = (isSaved) => ({
  type: actions.CHANGE_SAVED_STATUS,
  payload: {
    isSaved,
    lastUpdated: new Date()
  }
})

export const changeSection = (activeSection) => ({
  // Index of active article section
  type: actions.CHANGE_SECTION,
  payload: {
    activeSection
  }
})

export const changeView = (activeView) => ({
  // Content, Admin, Display
  type: actions.CHANGE_VIEW,
  payload: {
    activeView
  }
})

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
