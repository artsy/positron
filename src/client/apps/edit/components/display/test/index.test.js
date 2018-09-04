import configureStore from 'redux-mock-store'
import { cloneDeep } from 'lodash'
import { mount } from 'enzyme'
import React from 'react'
import { StandardArticle } from '@artsy/reaction/dist/Components/Publishing/Fixtures/Articles'
import { Provider } from 'react-redux'
import { EditDisplay } from '../index'
import { DisplayEmail } from '../components/email'
import { DisplayMagazine } from '../components/magazine'
import { DisplayPartner } from '../components/partner'
import { DisplaySearch } from '../components/search'
import { DisplaySocial } from '../components/social'
import { DropDownList } from 'client/components/drop_down/drop_down_list'

describe('EditDisplay', () => {
  let props

  const getWrapper = (props) => {
    const mockStore = configureStore([])

    const store = mockStore({
      app: {
        channel: props.channel
      },
      edit: {
        article: props.article
      }
    })

    return mount(
      <Provider store={store}>
        <EditDisplay {...props} />
      </Provider>
    )
  }

  beforeEach(() => {
    props = {
      article: cloneDeep(StandardArticle),
      channel: { type: 'editorial' },
      onChange: jest.fn()
    }
    props.article.email_metadata = {}
  })

  it('Renders section-list for non-partners, opens magazine panel by default', () => {
    const component = getWrapper(props)

    expect(component.find(DropDownList).exists()).toBe(true)
    expect(component.find(DisplayMagazine).exists()).toBe(true)
    expect(component.find(DisplayPartner).exists()).toBe(false)
  })

  it('Can dispay the social panel on click', () => {
    const component = getWrapper(props)
    component.find('.DropDownItem__title').at(1).simulate('click')

    expect(component.find(DropDownList).instance().state.activeSections[1]).toBe(1)
    expect(component.find(DisplaySocial).exists()).toBe(true)
  })

  it('Can dispay the search panel on click', () => {
    const component = getWrapper(props)
    component.find('.DropDownItem__title').at(2).simulate('click')

    expect(component.find(DropDownList).instance().state.activeSections[1]).toBe(2)
    expect(component.find(DisplaySearch).exists()).toBe(true)
  })

  it('Can dispay the email panel on click', () => {
    const component = getWrapper(props)
    component.find('.DropDownItem__title').at(3).simulate('click')

    expect(component.find(DropDownList).instance().state.activeSections[1]).toBe(3)
    expect(component.find(DisplayEmail).exists()).toBe(true)
  })

  it('Renders partner panel for partners', () => {
    props.channel.type = 'partner'
    const component = getWrapper(props)

    expect(component.find(DisplayPartner).exists()).toBe(true)
    expect(component.find(DropDownList).exists()).toBe(false)
    expect(component.find(DisplayMagazine).exists()).toBe(false)
  })
})
