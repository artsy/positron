import configureStore from 'redux-mock-store'
import { cloneDeep } from 'lodash'
import { mount } from 'enzyme'
import React from 'react'
import { Provider } from 'react-redux'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import { CharacterLimit } from '../../../../../components/character_limit'
import { DisplayMagazine } from '../components/magazine'
import ImageUpload from 'client/apps/edit/components/admin/components/image_upload.coffee'

describe('DisplayMagazine', () => {
  let props

  const getWrapper = (props) => {
    const mockStore = configureStore([])

    const store = mockStore({
      app: {
        channel: { type: 'editorial' }
      },
      edit: {
        article: props.article
      }
    })

    return mount(
      <Provider store={store}>
       <DisplayMagazine {...props} />
      </Provider>
    )
  }

  beforeEach(() => {
    props = {
      article: cloneDeep(Fixtures.StandardArticle),
      onChangeArticleAction: jest.fn()
    }
    props.article.thumbnail_image = 'https://artsy-media-uploads.s3.amazonaws.com/-El3gm6oiFkOUKhUv79lGQ%2Fd7hftxdivxxvm.cloudfront-6.jpg'
    props.article.description = 'To create a total experience that will create a feeling that is qualitatively new' 
  })

  it('Renders all form fields', () => {
    const component = getWrapper(props)

    expect(component.find(CharacterLimit).length).toBe(2)
    expect(component.find(ImageUpload).length).toBe(1)
  })

  it('Can display saved data', () => {
    const component = getWrapper(props)

    expect(component.html()).toMatch(props.article.thumbnail_title)
    expect(component.html()).toMatch(props.article.description)
    expect(component.html()).toMatch('El3gm6oiFkOUKhUv79lGQ%252Fd7hftxdivxxvm.cloudfront-6.jpg')
  })

  it('Can change the thumbnail image', () => {
    const component = getWrapper(props)
    const input = component.find(ImageUpload).at(0).getElement()
    input.props.onChange(input.props.name, 'http://new-image.jpg')

    expect(props.onChangeArticleAction.mock.calls[0][0]).toBe('thumbnail_image')
    expect(props.onChangeArticleAction.mock.calls[0][1]).toBe('http://new-image.jpg')
  })

  it('Can change the thumbnail title', () => {
    const component = getWrapper(props)
    const input = component.find(CharacterLimit).at(0).getElement()
    input.props.onChange('New title')

    expect(props.onChangeArticleAction.mock.calls[0][0]).toBe('thumbnail_title')
    expect(props.onChangeArticleAction.mock.calls[0][1]).toBe('New title')
  })

  it('Can change the description', () => {
    const component = getWrapper(props)
    const input = component.find(CharacterLimit).at(1).getElement()
    input.props.onChange('New description')

    expect(props.onChangeArticleAction.mock.calls[0][0]).toBe('description')
    expect(props.onChangeArticleAction.mock.calls[0][1]).toBe('New description')
  })
})
