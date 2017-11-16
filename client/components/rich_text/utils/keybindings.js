import {
  getDefaultKeyBinding,
  KeyBindingUtil
} from 'draft-js'

export const keyBindingFnFull = (e) => {
  if (KeyBindingUtil.hasCommandModifier(e)) {
    switch (e.keyCode) {
      // command + 1
      case 49:
        return 'header-one'
      // command + 2
      case 50:
        return 'header-two'
      // command + 3
      case 51:
        return 'header-three'
      // command + /
      case 191:
        return 'custom-clear'
      // command + 7
      case 55:
        return 'ordered-list-item'
      // command + 8
      case 56:
        return 'unordered-list-item'
      // command + k
      case 75:
        return 'link-prompt'
      // command + [
      case 219:
        return 'blockquote'
      // command + shift + X
      case 88:
        if (e.shiftKey) {
          return 'strikethrough'
        }
    }
  } else {
    return getDefaultKeyBinding(e)
  }
}

export const keyBindingFnCaption = (e) => {
  if (KeyBindingUtil.hasCommandModifier(e)) {
    if (e.keyCode === 75) {
      return 'link-prompt'
    }
  } else {
    return getDefaultKeyBinding(e)
  }
}
