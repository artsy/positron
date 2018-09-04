import React from 'react'
import { clone } from 'lodash'
import { mount } from 'enzyme'
import { StandardArticle } from '@artsy/reaction/dist/Components/Publishing/Fixtures/Articles'
import Icon from '@artsy/reaction/dist/Components/Icon'
import colors from '@artsy/reaction/dist/Assets/Colors'
import { EditHeader } from '../index'

describe('Edit Header Controls', () => {
  let props
  global.confirm = jest.fn(() => true)

  const getWrapper = (props) => {
    return mount(
      <EditHeader {...props} />
    )
  }

  beforeEach(() => {
    props = {
      beforeUnload: jest.fn(),
      article: clone(StandardArticle),
      changeViewAction: jest.fn(),
      channel: { type: 'partner' },
      deleteArticleAction: jest.fn(),
      edit: {
        isSaved: true,
        isSaving: false,
        isPublishing: false
      },
      isAdmin: false,
      publishArticleAction: jest.fn(),
      saveArticleAction: jest.fn()
    }
  })

  it('renders all buttons for standard user', () => {
    const component = getWrapper(props)

    expect(component.find('button').length).toBe(6)
  })

  it('renders admin button for admin users', () => {
    props.isAdmin = true
    const component = getWrapper(props)

    expect(component.find('button').length).toBe(7)
    expect(component.text()).toMatch('Admin')
  })

  it('renders auto-link button for editorial channel', () => {
    props.channel.type = 'editorial'
    const component = getWrapper(props)

    expect(component.find('button').length).toBe(7)
    expect(component.text()).toMatch('Auto-link')
  })

  describe('Checkmarks', () => {
    it('Content indicates completion if complete', () => {
      const component = getWrapper(props)

      expect(component.find(Icon).first().props().color).toBe(colors.greenRegular)
    })

    it('Content indicates non-completion', () => {
      delete props.article.title
      const component = getWrapper(props)

      expect(component.find(Icon).first().props().color).toBe(colors.grayMedium)
    })

    it('Display indicates completion if complete', () => {
      props.article.thumbnail_image = 'image.jpg'
      const component = getWrapper(props)

      expect(component.find(Icon).last().props().color).toBe(colors.greenRegular)
    })

    it('Display indicates non-completion', () => {
      delete props.article.thumbnail_image
      const component = getWrapper(props)

      expect(component.find(Icon).last().props().color).toBe(colors.grayMedium)
    })
  })

  describe('Actions', () => {
    it('Changes activeView on edit-tab click', () => {
      const component = getWrapper(props)
      const button = component.find('button').at(1)
      button.simulate('click')

      expect(props.changeViewAction.mock.calls[0][0]).toBe('display')
    })

    it('Publishes an article on button click', () => {
      props.article.thumbnail_image = 'image.jpg'
      const component = getWrapper(props)
      const button = component.find('button').at(2)
      button.simulate('click')

      expect(props.publishArticleAction).toBeCalled()
    })

    it('Unpublishes an article on button click', () => {
      props.article.thumbnail_image = 'image.jpg'
      props.article.published = true
      const component = getWrapper(props)
      const button = component.find('button').at(2)
      button.simulate('click')

      expect(props.publishArticleAction).toBeCalled()
    })

    xit('Calls auto-link on button click', () => {
      // TODO - Move auto-link into redux actions
    })

    it('Deletes an article on button click', () => {
      const component = getWrapper(props)
      const button = component.find('button').at(3)
      button.simulate('click')

      expect(global.confirm.mock.calls.length).toBe(1)
      expect(props.deleteArticleAction.mock.calls.length).toBe(1)
    })

    it('Saves an article on button click', () => {
      const component = getWrapper(props)
      const button = component.find('button').at(4)
      button.simulate('click')

      expect(props.saveArticleAction.mock.calls.length).toBe(1)
    })

    it('Saves a published article on button click', () => {
      props.article.published = true
      const component = getWrapper(props)
      const button = component.find('button').at(4)
      button.simulate('click')

      expect(props.saveArticleAction.mock.calls.length).toBe(1)
    })

    it('Removes beforeUnload listener on click', () => {
      window.removeEventListener = jest.fn()
      props.article.published = true
      const component = getWrapper(props)
      const button = component.find('button').at(4)
      button.simulate('click')

      expect(window.removeEventListener.mock.calls[3][0]).toBe('beforeunload')
      expect(window.removeEventListener.mock.calls[3][1]).toBe(props.beforeUnload)
    })
  })

  describe('Publish button', () => {
    beforeEach(() => {
      props.article.thumbnail_image = 'image.jpg'
    })

    it('Is disabled if content is not complete', () => {
      delete props.article.thumbnail_image
      const component = getWrapper(props)

      expect(component.html()).toMatch('data-disabled="true"')
    })

    it('Renders "Publish" if unpublished', () => {
      const component = getWrapper(props)

      expect(component.html()).toMatch('data-disabled="false"')
      expect(component.text()).toMatch('Publish')
    })

    it('Renders "Publishing..." if publishing and isPublishing', () => {
      props.edit.isPublishing = true
      // set article published because isPublished is set after save
      const component = getWrapper(props)

      expect(component.text()).toMatch('Publishing...')
    })

    it('Renders "Unpublish" if published', () => {
      props.article.published = true
      const component = getWrapper(props)

      expect(component.text()).toMatch('Unpublish')
    })

    it('Renders "Unpublishing..." if published and isPublishing', () => {
      props.edit.isPublishing = true
      props.article.published = true
      // set article published because isPublished is set after save
      const component = getWrapper(props)

      expect(component.text()).toMatch('Unpublishing...')
    })
  })

  describe('Save button', () => {
    it('Renders "Save Draft" if unpublished', () => {
      const component = getWrapper(props)

      expect(component.text()).toMatch('Save Draft')
    })

    it('Renders "Save Article" if published', () => {
      props.article.published = true
      const component = getWrapper(props)

      expect(component.text()).toMatch('Save Article')
    })

    it('Renders "Saving..." if isSaving', () => {
      props.edit.isSaving = true
      const component = getWrapper(props)

      expect(component.text()).toMatch('Saving...')
    })

    it('Color is red unless isSaved', () => {
      props.edit.isSaved = false
      const component = getWrapper(props)

      expect(component.instance().getSaveColor()).toBe(colors.redMedium)
    })

    it('Color is green if isSaving', () => {
      props.edit.isSaving = true
      const component = getWrapper(props)

      expect(component.instance().getSaveColor()).toBe(colors.greenRegular)
    })

    it('Color is black if isSaved', () => {
      props.edit.isSaved = true
      const component = getWrapper(props)

      expect(component.instance().getSaveColor()).toBe('black')
    })
  })

  describe('Preview button', () => {
    it('Renders "Preview" if unpublished', () => {
      const component = getWrapper(props)

      expect(component.html()).toMatch(props.article.slug)
      expect(component.html()).toMatch('Preview')
    })

    it('Renders "View" if published', () => {
      props.article.published = true
      const component = getWrapper(props)

      expect(component.html()).not.toMatch('Preview')
      expect(component.html()).toMatch('View')
    })
  })
})
