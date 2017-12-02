import keyMirror from 'client/lib/keyMirror'

export const actions = keyMirror(
  'CHANGE_SECTION',
  'SAVE',
  'CHANGE_SAVED_STATUS'
)

export const changeSection = (activeSection) => ({
  type: actions.CHANGE_SECTION,
  payload: {
    activeSection
  }
})

export const save = (article) => {
  article.save()

  return {
    type: actions.SAVE,
    payload: {
      saving: true
    }
  }
}

export const savedStatus = (isSaved) => ({
  type: actions.CHANGE_SAVED_STATUS,
  payload: {
    isSaved
  }
})
