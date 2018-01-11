import { mount } from 'enzyme'
import React from 'react'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import Article from '../../../../../models/article'
import { EditDisplay } from '../index'
import { DisplayEmail } from '../components/email'
import { DisplayMagazine } from '../components/magazine'
import { DisplayPartner } from '../components/partner'
import { DisplaySearch } from '../components/search'
import { DisplaySocial } from '../components/social'
import { DropDownList } from 'client/components/drop_down/drop_down_list'

describe('EditDisplay', () => {
  let props

  beforeEach(() => {
    props = {
      article: new Article(Fixtures.StandardArticle),
      channel: { get: jest.fn().mockReturnValue('editorial') },
      onChange: jest.fn()
    }
    props.article.set('email_metadata', {})
  })

  it('Renders section-list for non-partners, opens magazine panel by default', () => {
    const component = mount(
      <EditDisplay {...props} />
    )
    expect(component.find(DropDownList).length).toBe(1)
    expect(component.find(DisplayMagazine).length).toBe(1)
    expect(component.find(DisplayPartner).length).toBe(0)
  })

  it('Can dispay the social panel on click', () => {
    const component = mount(
      <EditDisplay {...props} />
    )
    component.find('.DropDownItem__title').at(1).simulate('click')
    expect(component.find(DropDownList).instance().state.activeSections[1]).toBe(1)
    expect(component.find(DisplaySocial).length).toBe(1)
  })

  it('Can dispay the search panel on click', () => {
    const component = mount(
      <EditDisplay {...props} />
    )
    component.find('.DropDownItem__title').at(2).simulate('click')
    expect(component.find(DropDownList).instance().state.activeSections[1]).toBe(2)
    expect(component.find(DisplaySearch).length).toBe(1)
  })

  it('Can dispay the email panel on click', () => {
    const component = mount(
      <EditDisplay {...props} />
    )
    component.find('.DropDownItem__title').at(3).simulate('click')
    expect(component.find(DropDownList).instance().state.activeSections[1]).toBe(3)
    expect(component.find(DisplayEmail).length).toBe(1)
  })

  it('Renders partner panel for partners', () => {
    props.channel.get.mockReturnValueOnce('partner')
    const component = mount(
      <EditDisplay {...props} />
    )
    expect(component.find(DisplayPartner).length).toBe(1)
    expect(component.find(DropDownList).length).toBe(0)
    expect(component.find(DisplayMagazine).length).toBe(0)
  })
})
