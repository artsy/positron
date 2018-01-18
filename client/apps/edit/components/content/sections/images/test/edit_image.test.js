import React from 'react'
import Backbone from 'backbone'
import { extend } from 'lodash'
import { mount } from 'enzyme'
import { Artwork, Fixtures, Image } from '@artsy/reaction-force/dist/Components/Publishing'
import { EditImage } from '../components/edit_image'
import { RemoveButton } from 'client/components/remove_button'
import Paragraph from 'client/components/rich_text/components/paragraph.coffee'
const { StandardArticle } = Fixtures

describe('EditImage', () => {
  let props
  let artwork = extend(StandardArticle.sections[4].images[2], {date: '2015'})
  let image = StandardArticle.sections[4].images[0]

  const getWrapper = (props) => {
    return mount(
      <EditImage {...props} />
    )
  }

  beforeEach(() => {
    props = {
      image,
      articleLayout: 'standard',
      section: new Backbone.Model(StandardArticle.sections[4]),
      index: 0,
      width: 200,
      removeImage: jest.fn(),
      onChange: jest.fn()
    }
  })

  it('renders an image', () => {
    const component = getWrapper(props)

    expect(component.find(Image).length).toBe(1)
    expect(component.html()).toMatch(
      'class="EditImage" style="width: 200px;"'
    )
    expect(component.html()).toMatch(
      'src="https://d7hftxdivxxvm.cloudfront.net?resize_to=width&amp;src=https%3A%2F%2Fartsy-media-uploads.s3.amazonaws.com%2F5ZP7vKuVPqiynVU0jpFewQ%252Funnamed.png&amp;width=1200&amp;quality=80'
    )
    expect(component.html()).toMatch(
      'alt="John Elisle, The Star, from the reimagined female Tarot cards. Courtesy of the artist.'
    )
  })

  it('renders an artwork', () => {
    props.image = artwork
    const component = getWrapper(props)

    expect(component.find(Artwork).length).toBe(1)
    expect(component.html()).toMatch(
      'class="EditImage" style="width: 200px;"'
    )
    expect(component.html()).toMatch(
      'src="https://d7hftxdivxxvm.cloudfront.net?resize_to=width&amp;src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FlSBz0tsfvOAm2qKdWwgxLw%2Flarger.jpg&amp;width=1200&amp;quality=80'
    )
    expect(component.html()).toMatch('<span class="name">Matt Devine</span>')
    expect(component.html()).toMatch('Brass Tax')
    expect(component.html()).toMatch('<span class="date">2015</span>')
    expect(component.text()).toMatch('Matt DevineBrass Tax, 2015Joanne Artman Gallery. Courtesy of The Metropolitan Museum of Art')
  })

  it('if image, renders an editable caption with placeholder', () => {
    props.image.caption = ''
    const component = getWrapper(props)

    expect(component.find(Paragraph).length).toBe(1)
    expect(component.html()).toMatch('class="public-DraftEditorPlaceholder-root"')
  })

  it('if artwork, does not render editable caption', () => {
    props.image = artwork
    const component = getWrapper(props)

    expect(component.find(Paragraph).length).toBe(0)
  })

  it('hides the remove button when not editing', () => {
    const component = getWrapper(props)

    expect(component.find(RemoveButton).length).toBe(0)
  })

  it('renders the remove button if editing and props.removeItem', () => {
    props.editing = true
    const component = getWrapper(props)

    expect(component.find(RemoveButton).length).toBe(1)
  })

  it('calls removeItem when clicking remove icon', () => {
    props.editing = true
    const component = getWrapper(props)

    component.find(RemoveButton).at(0).simulate('click')
    expect(props.removeImage).toBeCalled()
  })
})
