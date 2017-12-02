import Backbone from 'backbone'
import React from 'react'
import { EditHeader } from '../index'
import { mount } from 'enzyme'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import Icon from '@artsy/reaction-force/dist/Components/Icon'

describe('Edit Header Controls', () => {
  let props
  global.confirm = jest.fn(() => true)

  beforeEach(() => {
    props = {
      actions: {
        changeSection: jest.fn(),
        deleteArticle: jest.fn(),
        publishArticle: jest.fn(),
        saveArticle: jest.fn()
      },
      article: new Backbone.Model(Fixtures.StandardArticle),
      channel: new Backbone.Model(),
      edit: {
        isSaved: true,
        isSaving: false
      },
      user: {}
    }
  })

  it('renders all buttons for standard user', () => {
    const component = mount(
      <EditHeader {...props} />
    )
    expect(component.find('button').length).toBe(6)
  })

  it('renders admin button for admin users', () => {
    props.user.type = 'Admin'

    const component = mount(
      <EditHeader {...props} />
    )
    expect(component.find('button').length).toBe(7)
    expect(component.text()).toMatch('Admin')
  })

  it('renders auto-link button for editorial channel', () => {
    props.channel.set('type', 'editorial')

    const component = mount(
      <EditHeader {...props} />
    )
    expect(component.find('button').length).toBe(7)
    expect(component.text()).toMatch('Auto-link')
  })

  describe('Checkmarks', () => {
    it('Content indicates completion if complete', () => {
      const component = mount(
        <EditHeader {...props} />
      )
      expect(component.find(Icon).first().props().color).toBe('limegreen')
    })

    it('Content indicates non-completion', () => {
      delete props.article.attributes.title
      const component = mount(
        <EditHeader {...props} />
      )
      expect(component.find(Icon).first().props().color).toBe('#ccc')
    })

    it('Display indicates completion if complete', () => {
      props.article.set('thumbnail_image', 'image.jpg')
      const component = mount(
        <EditHeader {...props} />
      )
      expect(component.find(Icon).last().props().color).toBe('limegreen')
    })

    it('Display indicates non-completion', () => {
      const component = mount(
        <EditHeader {...props} />
      )
      expect(component.find(Icon).last().props().color).toBe('#ccc')
    })
  })

  describe('Actions', () => {
    it('Changes activeSection on edit-tab click', () => {
      const component = mount(
        <EditHeader {...props} />
      )
      const button = component.find('button').at(1)
      button.simulate('click')

      expect(props.actions.changeSection.mock.calls[0][0]).toBe('display')
    })

    it('Publishes an article on button click', () => {
      props.article.set('thumbnail_image', 'image.jpg')
      const component = mount(
        <EditHeader {...props} />
      )
      const button = component.find('button').at(2)
      button.simulate('click')

      expect(props.actions.publishArticle.mock.calls[0][0]).toBe(props.article)
      expect(props.actions.publishArticle.mock.calls[0][1]).toBe(true)
    })

    it('Unpublishes an article on button click', () => {
      props.article.set({
        thumbnail_image: 'image.jpg',
        published: true
      })
      const component = mount(
        <EditHeader {...props} />
      )
      const button = component.find('button').at(2)
      button.simulate('click')

      expect(props.actions.publishArticle.mock.calls[0][0]).toBe(props.article)
      expect(props.actions.publishArticle.mock.calls[0][1]).toBe(false)
    })

    xit('Calls auto-link on button click', () => {
      // TODO - Move auto-link into redux actions
    })

    it('Deletes an article on button click', () => {
      const component = mount(
        <EditHeader {...props} />
      )
      const button = component.find('button').at(3)
      button.simulate('click')

      expect(global.confirm.mock.calls.length).toBe(1)
      expect(props.actions.deleteArticle.mock.calls.length).toBe(1)
    })

    it('Saves an article on button click', () => {
      const component = mount(
        <EditHeader {...props} />
      )
      const button = component.find('button').at(4)
      button.simulate('click')

      expect(props.actions.saveArticle.mock.calls.length).toBe(1)
    })

    it('Saves a published article on button click', () => {
      props.article.trigger = jest.fn()
      props.article.set('published', true)
      const component = mount(
        <EditHeader {...props} />
      )
      const button = component.find('button').at(4)
      button.simulate('click')

      expect(props.actions.saveArticle.mock.calls.length).toBe(0)
      expect(props.article.trigger.mock.calls[2][0]).toBe('savePublished')
    })
  })

  describe('Publish button', () => {
    beforeEach(() => {
      props.article.set('thumbnail_image', 'image.jpg')
    })

    it('Is disabled if content is not complete', () => {
      delete props.article.attributes.thumbnail_image
      const component = mount(
        <EditHeader {...props} />
      )
      expect(component.html()).toMatch('data-disabled="true"')
    })

    it('Renders "Publish" if unpublished', () => {
      const component = mount(
        <EditHeader {...props} />
      )
      expect(component.html()).toMatch('data-disabled="false"')
      expect(component.html()).toMatch('Publish')
    })

    it('Renders "Publishing..." if publishing and isPublishing', () => {
      props.edit.isPublishing = true
      props.article.set('published', true)
      // set article published because isPublished is set after save
      const component = mount(
        <EditHeader {...props} />
      )
      expect(component.html()).toMatch('Publishing...')
    })

    it('Renders "Unpublish" if published', () => {
      props.article.set('published', true)
      const component = mount(
        <EditHeader {...props} />
      )
      expect(component.html()).toMatch('Unpublish')
    })

    it('Renders "Unpublishing..." if published and isPublishing', () => {
      props.edit.isPublishing = true
      props.article.set('published', false)
      // set article published because isPublished is set after save
      const component = mount(
        <EditHeader {...props} />
      )
      expect(component.html()).toMatch('Unpublishing...')
    })
  })

  describe('Save button', () => {
    it('Renders "Save Draft" if unpublished', () => {
      const component = mount(
        <EditHeader {...props} />
      )
      expect(component.html()).toMatch('Save Draft')
    })

    it('Renders "Save Article" if published', () => {
      props.article.set('published', true)
      const component = mount(
        <EditHeader {...props} />
      )
      expect(component.html()).toMatch('Save Article')
    })

    it('Renders "Saving..." if isSaving', () => {
      props.edit.isSaving = true
      const component = mount(
        <EditHeader {...props} />
      )
      expect(component.html()).toMatch('Saving...')
    })

    it('Color is red unless isSaved', () => {
      props.edit.isSaved = false
      const component = mount(
        <EditHeader {...props} />
      )
      expect(component.html()).toMatch('color: rgb(247, 98, 90)')
    })

    it('Color is green if isSaving', () => {
      props.edit.isSaving = true
      const component = mount(
        <EditHeader {...props} />
      )
      expect(component.find('button').at(4).props().style.color).toBe('limegreen')
    })

    it('Color is black if isSaved', () => {
      props.edit.isSaved = true
      const component = mount(
        <EditHeader {...props} />
      )
      expect(component.find('button').at(4).props().style.color).toBe('black')
    })
  })

  describe('Preview button', () => {
    it('Renders "Preview" if unpublished', () => {
      const component = mount(
        <EditHeader {...props} />
      )
      expect(component.html()).toMatch(props.article.get('slug'))
      expect(component.html()).toMatch('Preview')
    })

    it('Renders "View" if published', () => {
      props.article.set('published', true)
      const component = mount(
        <EditHeader {...props} />
      )
      expect(component.html()).not.toMatch('Preview')
      expect(component.html()).toMatch('View')
    })
  })
})
