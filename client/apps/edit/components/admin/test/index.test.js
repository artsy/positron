import { shallow } from 'enzyme'
import React from 'react'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import Article from '../../../../../models/article'
import AdminTags from '../verticals_tags/index.coffee'
import AdminVerticalsTags from '../verticals_tags/editorial.coffee'
import { DropDownList } from 'client/components/drop_down/drop_down_list'
import { EditAdmin } from '../index.jsx'
require('typeahead.js')

describe('EditAdmin', () => {
  let props

  beforeEach(() => {
    props = {
      article: new Article(Fixtures.StandardArticle),
      channel: {
        hasFeature: jest.fn().mockReturnValue(true),
        isEditorial: jest.fn().mockReturnValue(true)
      },
      onChange: jest.fn()
    }
  })

  it('Renders dropdown', () => {
    const component = shallow(
      <EditAdmin {...props} />
    )
    expect(component.find(DropDownList).length).toBe(1)
  })

  it('Renders editorial sections', () => {
    const component = shallow(
      <EditAdmin {...props} />
    )
    expect(component.find(AdminVerticalsTags).length).toBe(1)
    expect(component.html()).toMatch('Super Article')
    expect(component.html()).toMatch('Sponsor')
  })

  it('Renders correct sections for non-editorial articles', () => {
    props.channel.isEditorial = jest.fn().mockReturnValue(false)
    props.channel.hasFeature = jest.fn().mockReturnValue(false)
    const component = shallow(
      <EditAdmin {...props} />
    )
    expect(component.find(AdminTags).length).toBe(1)
    expect(component.find(AdminVerticalsTags).length).toBe(0)
    expect(component.html()).not.toMatch('Super Article')
    expect(component.html()).not.toMatch('Sponsor')
  })
})
