import {
  getSelectionLocation,
  stickyControlsBox
} from '../../utils/text_selection.js'

jest.unmock('draft-js')
const Draft = require.requireActual('draft-js')
window.pageYOffset = 500

describe('Draft Utils: Text Selection', () => {
  describe('#getSelectionLocation', () => {
    it('Returns coordinates of the selection and its parent', () => {
      const selection = {
        bottom: 170,
        height: 25,
        left: 425,
        right: 525,
        top: 145,
        width: 95
      }
      Draft.getVisibleSelectionRect = jest.fn().mockReturnValue(selection)
      const location = getSelectionLocation({top: 520, left: 50})

      expect(location.target).toBe(selection)
      expect(location.parent.top).toBe(20)
      expect(location.parent.left).toBe(50)
    })
  })

  describe('#stickyControlsBox', () => {
    it('Returns coordinates of the sticky item', () => {
      const position = stickyControlsBox({top: 520, left: 50}, 50, 100)
      expect(position.top).toBe(175)
      expect(position.left).toBe(322.5)
    })
  })
})
