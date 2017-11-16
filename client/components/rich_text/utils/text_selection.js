import {
  getVisibleSelectionRect
} from 'draft-js'

export const getSelectionLocation = ($parent) => {
  // get x/y location of currently selected text
  let target = getVisibleSelectionRect(window)
  const parent = {
    top: $parent.top - window.pageYOffset,
    left: $parent.left
  }

  return { target, parent }
}

export const stickyControlsBox = (editorPosition, fromTop, fromLeft) => {
  const { target, parent } = exports.getSelectionLocation(editorPosition)
  const top = target.top - parent.top + fromTop
  const left = target.left - parent.left + (target.width / 2) - fromLeft

  return { top, left }
}
