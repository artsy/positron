import { getDefaultKeyBinding, KeyBindingUtil } from 'draft-js'

export const keyBindingFnFull = (e) => {
  // Custom key commands for full editor
  if (KeyBindingUtil.hasCommandModifier(e)) {
    switch (e.keyCode) {
      case 49:
        // command + 1
        return 'header-one'
      case 50:
        // command + 2
        return 'header-two'
      case 51:
        // command + 3
        return 'header-three'
      case 191:
        // command + /
        return 'custom-clear'
      case 55:
        // command + 7
        return 'ordered-list-item'
      case 56:
        // command + 8
        return 'unordered-list-item'
      case 75:
        // command + k
        return 'link-prompt'
      case 219:
        // command + [
        return 'blockquote'
      case 88:
        // command + shift + X
        if (e.shiftKey) {
          return 'strikethrough'
        }
    }
  }
  return getDefaultKeyBinding(e)
}

export const keyBindingFnParagraph = (e) => {
  // Custom key commands for paragraph editor
  if (KeyBindingUtil.hasCommandModifier(e)) {
    if (e.keyCode === 75) {
      return 'link-prompt'
    }
  } else {
    return getDefaultKeyBinding(e)
  }
}
