import { mount } from 'enzyme'
import React from 'react'
import { InputArtworkUrl } from '../components/input_artwork_url'
import { Artworks } from '@artsy/reaction-force/dist/Components/Publishing/Fixtures/Components'

describe('InputArtworkUrl', () => {
  let props = {
    addArtwork: jest.fn(),
    disabled: false,
    fetchArtwork: jest.fn().mockReturnValue(Artworks[0])
  }

  const artworkUrl = 'https://www.artsy.net/artwork/chip-hughes-stripes'

  const getWrapper = (props) => {
    return mount(
      <InputArtworkUrl {...props} />
    )
  }

  it('Renders input and button', () => {
    const component = getWrapper(props)

    expect(component.find('input').length).toBe(1)
    expect(component.find('button').length).toBe(1)
  })

  it('Input can be disabled with props', () => {
    props.disabled = true
    const component = getWrapper(props)

    expect(component.find('input').first().getElement().props.disabled).toBe(true)
  })

  it('Sets input value to state.url on change', () => {
    const component = getWrapper(props)
    const input = component.find('input').first()

    input.simulate('change', {target: { value: artworkUrl }})
    expect(component.state().url).toBe(artworkUrl)
  })

  it('Calls getIdFromSlug on button click', () => {
    const component = getWrapper(props)
    const button = component.find('button').first()
    component.instance().getIdFromSlug = jest.fn()

    button.simulate('click')
    expect(component.instance().getIdFromSlug.mock.calls.length).toBe(1)
  })

  it('Calls getIdFromSlug on enter', () => {
    const component = getWrapper(props)
    const input = component.find('input').first()
    component.instance().getIdFromSlug = jest.fn()

    input.simulate('keyup', {key: 'Enter'})
    expect(component.instance().getIdFromSlug.mock.calls.length).toBe(1)
  })

  it('#getIdFromSlug returns an id and calls addArtwork', () => {
    const component = getWrapper(props)
    component.instance().addArtwork = jest.fn()

    component.instance().getIdFromSlug(artworkUrl)
    expect(component.instance().addArtwork.mock.calls[0][0]).toBe('chip-hughes-stripes')
  })

  it('#addArtwork fetches an artwork and calls props.addArtwork', async () => {
    const component = getWrapper(props)

    await component.instance().getIdFromSlug(artworkUrl)
    expect(props.fetchArtwork.mock.calls[0][0]).toBe('chip-hughes-stripes')
    expect(props.addArtwork.mock.calls[0][0]).toBe(Artworks[0])
  })
})
