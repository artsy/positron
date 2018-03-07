import request from 'superagent'
import { cloneDeep } from 'lodash'
import { mount } from 'enzyme'
import React from 'react'
import { Fixtures } from '@artsy/reaction/dist/Components/Publishing'
import { FeaturingInput } from '../../../components/featuring/featuring_input'
import { ArtistQuery } from 'client/queries/metaphysics'

jest.mock('superagent', () => {
  return {
    get: jest.genMockFunction().mockReturnThis(),
    set: jest.genMockFunction().mockReturnThis(),
    query: jest.genMockFunction().mockReturnThis(),
    end: jest.fn()
  }
})

describe('FeaturingInput', () => {
  const getWrapper = (props) => {
    return mount(
      <FeaturingInput {...props} />
    )
  }
  let props
  let response
  let value

  beforeEach(() => {
    value = 'http://artsy.net/artist/pablo-picasso'
    props = {
      article: cloneDeep(Fixtures.StandardArticle),
      metaphysicsURL: 'https://metaphysics-staging.artsy.net',
      model: 'artist',
      onAddFeaturedItemAction: jest.fn(),
      user: { access_token: '' }
    }

    response = {
      body: {
        data: {
          artist: {
            _id: '123',
            name: 'Pablo Picasso'
          }
        }
      }
    }
  })

  it('Renders input', () => {
    const component = getWrapper(props)
    const input = component.find('input').getElement().props

    expect(input.placeholder).toBe('Add an artist by slug or URL...')
  })

  it('Can change the input value', () => {
    const component = getWrapper(props)
    component.find('input').simulate('change', {target: { value }})

    expect(component.state().value).toBe(value)
  })

  it('Input calls #onFeature on enter', () => {
    const component = getWrapper(props)
    component.instance().onFeature = jest.fn()
    const input = component.find('input')
    input.simulate('change', {target: { value }})
    input.simulate('keydown', {key: 'Enter'})

    expect(component.instance().onFeature.mock.calls[0][0]).toBe(value)
  })

  it('#onFeature strips the id from slug and calls #fetchItem', () => {
    const component = getWrapper(props)
    component.instance().fetchItem = jest.fn()
    component.instance().onFeature(value)

    expect(component.instance().fetchItem.mock.calls[0][0]).toBe('pablo-picasso')
  })

  it('#getQuery returns the correct query for props.model', () => {
    const component = getWrapper(props)
    component.instance().onFeature('pablo-picasso')

    expect(request.query.mock.calls[0][0].query).toBe(ArtistQuery)
  })

  it('#fetchItem adds the item to featured after fetch', () => {
    request.end.mockImplementation(() => {
      props.onAddFeaturedItemAction(response.body.data.artist)
    })
    const component = getWrapper(props)
    component.instance().onFeature('pablo-picasso')

    expect(props.onAddFeaturedItemAction.mock.calls[0][0].name).toBe('Pablo Picasso')
  })
})
