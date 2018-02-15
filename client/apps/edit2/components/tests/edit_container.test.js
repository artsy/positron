import React from 'react'
import configureStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import { mount, shallow } from 'enzyme'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import Article from '../../../../models/article.coffee'
import { EditContainer } from '../edit_container'
import { EditAdmin } from '../admin/index.jsx'
import { EditContent } from '../content/index.jsx'
import { EditDisplay } from '../display/index.jsx'
import { EditHeader } from '../header/index.jsx'
import { EditError } from '../error/index.jsx'

require('typeahead.js')

describe('EditContainer', () => {
  let props

  const getWrapper = (props) => {
    const mockStore = configureStore([])

    const store = mockStore({
      app: {
        channel: props.channel
      },
      edit: {
        activeView: props.activeView,
        article: props.article,
        error: props.error
      }
    })

    return mount(
      <Provider store={store}>
        <EditContainer {...props} />
      </Provider>
    )
  }

  const getShallowWrapper = (props) => {
    return shallow(
      <EditContainer {...props} />
    )
  }

  beforeEach(() => {
    props = {
      activeView: 'content',
      article: new Article(Fixtures.StandardArticle),
      changeSavedStatusAction: jest.fn(),
      channel: {},
      error: {},
      isSaved: false,
      saveArticleAction: jest.fn(),
      toggleSpinnerAction: jest.fn(),
      startEditingArticleAction: jest.fn(),
      stopEditingArticleAction: jest.fn(),
      updateArticleAction: jest.fn(),
      user: {
        id: '123',
        name: 'John Doe'
      },
      currentSession: {
        user: {
          id: '123'
        }
      }
    }
    window.addEventListener = jest.fn()
  })

  it('#componentDidMount hides the loading spinner', () => {
    getShallowWrapper(props)
    expect(props.toggleSpinnerAction.mock.calls[0][0]).toBe(false)
  })

  it('sets up an event listener for #beforeUnload when a published article changes', () => {
    props.article.set('published', true)
    const component = getShallowWrapper(props)
    component.instance().props.article.set('title', 'New Title')

    expect(window.addEventListener.mock.calls[0][0]).toBe('beforeunload')
  })

  it('#onChange sets the article with key/value and calls #maybeSaveArticle', () => {
    const title = 'New Title'
    const component = getShallowWrapper(props)
    component.instance().onChange('title', title)

    expect(props.saveArticleAction.mock.calls[0][0].get('title')).toBe(title)
  })

  it('#onChangeHero sets the article hero_section with key/value and calls #maybeSaveArticle', () => {
    const url = 'New Url'
    const component = getShallowWrapper(props)
    component.instance().onChangeHero('url', url)

    expect(props.saveArticleAction.mock.calls[0][0].get('hero_section').url).toBe(url)
  })

  it('sends a #startEditingArticleAction when mounting', () => {
    const wrapper = getWrapper(props)
    expect(props.startEditingArticleAction.mock.calls[0][0]).toMatchObject({
      user: props.user,
      article: props.article.id
    })
    wrapper.unmount()
  })

  it('sends a #stopEditingArticleAction when unmounting', () => {
    const wrapper = getWrapper(props)
    wrapper.unmount()
    expect(props.stopEditingArticleAction.mock.calls[0][0]).toMatchObject({
      user: props.user,
      article: props.article.id
    })
  })

  it('sets #inactivityPeriodEntered to true after the standby time is exceeded', () => {
    jest.useFakeTimers()
    const assignFn = window.document.location.assign = jest.fn()
    const wrapper = getWrapper(props)
    const instance = wrapper.find(EditContainer).instance()
    expect(instance.state.inactivityPeriodEntered).toBeFalsy()

    // jest.runAllTimers()
    jest.advanceTimersByTime(700 * 1000)

    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 600 * 1000)
    expect(instance.state.inactivityPeriodEntered).toBeTruthy()
    expect(assignFn).toBeCalledWith('/')
  })

  describe('#maybeSaveArticle', () => {
    it('Calls #saveArticleAction if unpublished', () => {
      const component = getShallowWrapper(props)
      component.instance().maybeSaveArticle()

      expect(props.saveArticleAction.mock.calls[0][0]).toBe(props.article)
    })

    it('Calls #changeSavedStatusAction if published', () => {
      props.article.set('published', true)
      const component = getShallowWrapper(props)
      component.instance().maybeSaveArticle()

      expect(props.changeSavedStatusAction.mock.calls[0][0]).toBe(props.article.attributes)
      expect(props.changeSavedStatusAction.mock.calls[0][1]).toBe(false)
    })
  })

  describe('Rendering', () => {
    it('Renders the EditHeader', () => {
      const component = getWrapper(props).find(EditContainer)
      expect(component.find(EditHeader).exists()).toBe(true)
    })

    describe('activeView', () => {
      it('Can render the content activeView', () => {
        const component = getWrapper(props).find(EditContainer)
        expect(component.find(EditContent).exists()).toBe(true)
      })

      it('Can render the admin activeView', () => {
        props.activeView = 'admin'
        const component = getShallowWrapper(props)

        expect(component.find(EditAdmin).exists()).toBe(true)
      })

      it('Can render the admin activeView', () => {
        props.activeView = 'display'
        const component = getWrapper(props).find(EditContainer)

        expect(component.find(EditDisplay).exists()).toBe(true)
      })
    })

    it('Displays an error message if present', () => {
      props.error = {message: 'an error'}
      const component = getWrapper(props).find(EditContainer)

      expect(component.text()).toMatch(props.error.message)
      expect(component.find(EditError).exists()).toBe(true)
    })
  })
})
