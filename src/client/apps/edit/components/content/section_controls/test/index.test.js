import configureStore from 'redux-mock-store'
import React from 'react'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'
import { LayoutControls } from '../layout.jsx'
import { SectionControls } from '../index'
import { StandardArticle } from '@artsy/reaction/dist/Components/Publishing/Fixtures/Articles'

describe('Section Controls', () => {
  let props

  SectionControls.prototype.isScrollingOver = jest.fn().mockReturnValue(true)
  SectionControls.prototype.isScrolledPast = jest.fn().mockReturnValue(false)
  $.fn.offset = jest.fn().mockReturnValue({ top: 200 })
  $.fn.height = jest.fn().mockReturnValue(200)
  $.fn.closest = jest.fn().mockReturnThis()

  const getWrapper = (props) => {
    const mockStore = configureStore([])
    const store = mockStore({
      app: {
        channel: props.channel
      },
      edit: {
        article: props.article,
        section: props.section,
        sectionIndex: props.sectionIndex
      }
    })

    return mount(
      <Provider store={store}>
        <section>
          <SectionControls {...props} />
        </section>
      </Provider>
    )
  }

  beforeEach(() => {
    props = {
      channel: { type: 'editorial' },
      section: StandardArticle.sections[4],
      article: { layout: 'standard' },
      onChange: jest.fn(),
      disabledAlert: jest.fn(),
      showLayouts: true
    }
  })

  describe('Section Layouts', () => {
    it('does not render section layouts unless showLayouts', () => {
      props.showLayouts = false
      const component = getWrapper(props)

      expect(component.find(LayoutControls).exists()).toBe(false)
    })

    it('renders section layouts if showLayouts is true', () => {
      const component = getWrapper(props)

      expect(component.find(LayoutControls).exists()).toBe(true)
    })
  })

  describe('#setInsideComponent', () => {
    it('returns true if item is scrolled over and not scrolled past', () => {
      const component = getWrapper(props).find(SectionControls).instance()
      component.setInsideComponent()

      expect(component.state.insideComponent).toBe(true)
    })

    it('returns false if item is scrolled past', () => {
      const component = getWrapper(props).find(SectionControls).instance()
      component.isScrolledPast = jest.fn().mockReturnValue(true)
      component.setInsideComponent()

      expect(component.state.insideComponent).toBe(false)
    })

    it('returns false when hero section', () => {
      props.isHero = true
      const component = getWrapper(props).find(SectionControls).instance()

      component.setInsideComponent()
      expect(component.state.insideComponent).toBe(false)
    })
  })

  describe('#getHeaderSize', () => {
    it('returns 55 when channel is not artsy channel', () => {
      props.channel.type = 'partner'
      const component = getWrapper(props).find(SectionControls).instance()
      const header = component.getHeaderHeight()

      expect(header).toBe(55)
    })

    it('returns 95 when channel is artsy channel', () => {
      const component = getWrapper(props).find(SectionControls).instance()
      const header = component.getHeaderHeight()

      expect(header).toBe(95)
    })
  })

  describe('#getPositionBottom', () => {
    it('when insideComponent, calculates based on window scroll position', () => {
      props.isHero = false
      const component = getWrapper(props).find(SectionControls).instance()
      component.setState({ insideComponent: true })
      const bottom = component.getPositionBottom()

      expect(bottom).toBe('605px')
    })

    it('when outside component, returns 100%', () => {
      const component = getWrapper(props).find(SectionControls).instance()

      component.setState({ insideComponent: false })
      const bottom = component.getPositionBottom()
      expect(bottom).toBe('100%')
    })
  })
})
