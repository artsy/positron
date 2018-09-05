import configureStore from 'redux-mock-store'
import React from 'react'
import { cloneDeep } from 'lodash'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'
import { StandardArticle } from '@artsy/reaction/dist/Components/Publishing/Fixtures/Articles'
import { CharacterLimit } from '../../../../../components/character_limit'
import { DisplayEmail } from '../components/email'
import ImageUpload from '../../admin/components/image_upload.coffee'

describe('DisplayEmail', () => {
  let article
  let props
  let email_metadata

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
        <DisplayEmail {...props} />
      </Provider>
    )
  }

  beforeEach(() => {
    article = cloneDeep(StandardArticle)
    email_metadata = {
      author: 'Molly Gottschalk',
      custom_text: 'To create a total experience that will create a feeling that is qualitatively new: That is ultimately the most radical thing.',
      headline: 'Virtual Reality Is the Most Powerful Artistic Medium of Our Time',
      image_url: 'https://artsy-media-uploads.s3.amazonaws.com/-El3gm6oiFkOUKhUv79lGQ%2Fd7hftxdivxxvm.cloudfront-6.jpg'
    }
    article.email_metadata = email_metadata

    props = {
      article,
      onChangeArticleAction: jest.fn()
    }
  })

  it('Renders all form fields', () => {
    delete props.article.email_metadata
    const component = getWrapper(props)

    expect(component.find(CharacterLimit).length).toBe(2)
    expect(component.find('input').length).toBe(3)
    expect(component.find(ImageUpload).length).toBe(1)
    expect(component.find('input[type="checkbox"]').length).toBe(1)
  })

  it('Can display saved data', () => {
    const component = getWrapper(props)

    expect(component.html()).toMatch(email_metadata.author)
    expect(component.html()).toMatch(email_metadata.custom_text)
    expect(component.html()).toMatch(email_metadata.headline)
    expect(component.html()).toMatch('El3gm6oiFkOUKhUv79lGQ%252Fd7hftxdivxxvm.cloudfront-6.jpg')
  })

  it('Can save with empty email_metadata', () => {
    delete props.article.email_metadata
    const component = getWrapper(props)

    const input = component.find(CharacterLimit).at(0).getElement()
    input.props.onChange('data')
    expect(props.onChangeArticleAction.mock.calls[0][0]).toBe('email_metadata')
  })

  it('Can change the email image', () => {
    const component = getWrapper(props)

    const input = component.find(ImageUpload).at(0).getElement()
    input.props.onChange(input.props.name, 'http://new-image.jpg')

    expect(props.onChangeArticleAction.mock.calls[0][0]).toBe('email_metadata')
    expect(props.onChangeArticleAction.mock.calls[0][1].image_url).toBe('http://new-image.jpg')
  })

  it('Can change the email headline', () => {
    const component = getWrapper(props)

    const input = component.find(CharacterLimit).at(0).getElement()
    input.props.onChange('New Headline')

    expect(props.onChangeArticleAction.mock.calls[0][0]).toBe('email_metadata')
    expect(props.onChangeArticleAction.mock.calls[0][1].headline).toBe('New Headline')
  })

  it('Can change the custom text', () => {
    const component = getWrapper(props)

    const input = component.find(CharacterLimit).at(1).getElement()
    input.props.onChange('New Custom Text')

    expect(props.onChangeArticleAction.mock.calls[0][0]).toBe('email_metadata')
    expect(props.onChangeArticleAction.mock.calls[0][1].custom_text).toBe('New Custom Text')
  })

  it('Can change the author', () => {
    const component = getWrapper(props)

    const input = component.find('input').at(1)
    input.simulate('change', { target: { value: 'New Author' } })

    expect(props.onChangeArticleAction.mock.calls[0][0]).toBe('email_metadata')
    expect(props.onChangeArticleAction.mock.calls[0][1].author).toBe('New Author')
  })

  it('Can change the send to sailthru checkbox', () => {
    const component = getWrapper(props)

    const input = component.find('.flat-checkbox').at(0)
    input.simulate('click')

    expect(props.onChangeArticleAction.mock.calls[0][0]).toBe('send_body')
    expect(props.onChangeArticleAction.mock.calls[0][1]).toBe(!props.article.send_body)
  })
})
