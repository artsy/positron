import { shallow } from 'enzyme'
import React from 'react'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import Article from '../../../../../models/article.coffee'
import { DropDownList } from 'client/components/drop_down/drop_down_list'
import { AdminTags } from '../components/tags'
import { AdminVerticalsTags } from '../components/verticals_tags'
import { EditAdmin } from '../index.jsx'
require('typeahead.js')

describe('EditAdmin', () => {
  let props

  beforeEach(() => {
    props = {
      article: new Article(Fixtures.StandardArticle),
      channel: { type: 'editorial' },
      onChange: jest.fn()
    }
  })

  const getWrapper = (props) => {
    return shallow(
      <EditAdmin {...props} />
    )
  }

  it('Renders dropdown', () => {
    const component = getWrapper(props)

    expect(component.find(DropDownList).exists()).toBe(true)
  })

  it('Renders editorial sections', () => {
    const component = getWrapper(props)

    expect(component.find(AdminVerticalsTags).exists()).toBe(true)
    expect(component.html()).toMatch('Super Article')
    expect(component.html()).toMatch('Sponsor')
  })

  it('Renders correct sections for non-editorial articles', () => {
    props.channel.type = 'partner'
    const component = getWrapper(props)

    expect(component.find(AdminTags).exists()).toBe(true)
    expect(component.find(AdminVerticalsTags).exists()).toBe(false)
    expect(component.html()).not.toMatch('Super Article')
    expect(component.html()).not.toMatch('Sponsor')
  })
})
