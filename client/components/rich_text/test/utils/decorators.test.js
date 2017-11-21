import { setContentEnd } from '../../utils/decorators'

describe('Draft Utils: Decorators', () => {
  describe('#setContentEnd', () => {
    it('Strips content-end from a section if isEndText is false', () => {
      const html = '<p>Here is start text.</p><p>Here is end text.<span class="content-end"></span></p>'
      expect(setContentEnd(html)).toBe('<p>Here is start text.</p><p>Here is end text.</p>')
    })

    it('Strips content-end from text that is not end of block', () => {
      const html = '<p>Here is start text.<span class="content-end"></span></p><p>Here is end text.</p>'
      expect(setContentEnd(html)).toBe('<p>Here is start text.</p><p>Here is end text.</p>')
    })

    it('Adds content-end to a section if isEndText is true', () => {
      const html = '<p>Here is start text.</p><p>Here is end text.<span class="content-end"></span></p>'
      expect(setContentEnd(html, true)).toBe(
        '<p>Here is start text.</p><p>Here is end text.<span class="content-end"> </span></p>'
      )
    })
  })
})
