import request from 'superagent'
import { clone } from 'lodash'
import { mount } from 'enzyme'
import React from 'react'
import { StandardArticle } from '@artsy/reaction/dist/Components/Publishing/Fixtures/Articles'
import { AutocompleteList } from 'client/components/autocomplete2/list'
import { AutocompleteListMetaphysics } from 'client/components/autocomplete2/list_metaphysics'
import * as Queries from 'client/queries/metaphysics'
require('typeahead.js')

jest.mock('superagent', () => {
  return {
    get: jest.genMockFunction().mockReturnThis(),
    set: jest.genMockFunction().mockReturnThis(),
    query: jest.fn().mockReturnValue(
      {
        end: jest.fn()
      }
    )
  }
})

describe('AutocompleteListMetaphysics', () => {
  let props
  let response

  const getWrapper = (props) => {
    return mount(
      <AutocompleteListMetaphysics {...props} />
    )
  }

  beforeEach(() => {
    let article = clone(StandardArticle)
    props = {
      article,
      artsyURL: 'https://artsy.net',
      field: 'fair_ids',
      metaphysicsURL: 'https://metaphysics-staging.artsy.net',
      model: 'fairs',
      onChangeArticleAction: jest.fn(),
      placeholder: 'Search fairs by name...'
    }

    response = {
      body: {
        data: {
          fairs: [{
            _id: '123',
            name: 'NADA New York'
          }]
        }
      }
    }

    request.get = jest.genMockFunction().mockReturnThis()
    request.set = jest.genMockFunction().mockReturnThis()
    request.query = jest.fn().mockReturnValue(
      {
        end: jest.fn()
      }
    )
  })

  it('Renders autocomplete field', () => {
    const component = getWrapper(props)
    expect(component.find(AutocompleteList).exists()).toBe(true)
    expect(component.find('input').getElement().props.placeholder).toBe('Search fairs by name...')
  })

  it('Renders label', () => {
    props.label = 'Fairs'
    const component = getWrapper(props)
    const label = component.find('label').first()

    expect(label.text()).toBe('Fairs')
  })

  describe('#getQuery', () => {
    it('Returns the correct query for fairs', () => {
      const component = getWrapper(props)
      const query = component.instance().getQuery('fairs')

      expect(query).toBe(Queries.FairsQuery)
    })

    it('Returns the correct query for partners', () => {
      props.model = 'partners'
      const component = getWrapper(props)
      const query = component.instance().getQuery()

      expect(query).toBe(Queries.PartnersQuery)
    })

    it('Returns the correct query for shows', () => {
      props.model = 'partner_shows'
      const component = getWrapper(props)
      const query = component.instance().getQuery('partner_shows')

      expect(query).toBe(Queries.ShowsQuery)
    })

    it('Returns the correct query for auctions', () => {
      props.model = 'sales'
      const component = getWrapper(props)
      const query = component.instance().getQuery()

      expect(query).toBe(Queries.AuctionsQuery)
    })

    it('Returns the correct query for artists', () => {
      props.model = 'artists'
      const component = getWrapper(props)
      const query = component.instance().getQuery()

      expect(query).toBe(Queries.ArtistsQuery)
    })

    it('Returns the correct query for users', () => {
      props.model = 'users'
      const component = getWrapper(props)
      const query = component.instance().getQuery()

      expect(query).toBe(Queries.UsersQuery)
    })
  })

  it('#idsToFetch returns unfetched ids based on field and fetchedItems', () => {
    props.article.fair_ids = ['123', '456']
    const component = getWrapper(props)
    const idsToFetch = component.instance().idsToFetch([{ _id: '123' }])

    expect(idsToFetch.length).toBe(1)
    expect(idsToFetch[0]).toBe('456')
  })

  it('#idsToFetch returns unfetched ids for users', () => {
    props.model = 'users'
    props.field = 'contributing_authors'
    props.article.contributing_authors = [{ id: '123' }, { id: '456' }]
    const component = getWrapper(props)
    const idsToFetch = component.instance().idsToFetch([{ id: '123' }])

    expect(idsToFetch.length).toBe(1)
    expect(idsToFetch[0]).toBe('456')
  })

  describe('#fetchItem', () => {
    it('Calls query with id to fetch', () => {
      const query = jest.fn()
      props.article.biography_for_artist_id = '123'
      props.type = 'single'
      props.model = 'artists'
      props.field = 'biography_for_artist_id'
      const component = getWrapper(props)
      component.instance().getQuery = jest.fn(() => {
        return query
      })
      component.instance().fetchItem('123', jest.fn())

      expect(component.instance().getQuery.mock.calls[0][0]).toBe('artists')
      expect(query.mock.calls[0].length).toBe(1)
      expect(query.mock.calls[0][0]).toBe(props.article.biography_for_artist_id)
    })

    it('Makes a request to metaphysics', () => {
      props.article.fair_id = '123'
      props.type = 'single'
      props.model = 'fairs'
      props.field = 'fair_id'
      request.query().end.mockImplementation(() => {
        return response.body.data.fairs
      })
      const component = getWrapper(props)
      component.instance().fetchItem('123', jest.fn())

      expect(request.get.mock.calls[0][0]).toBe(props.metaphysicsURL)
      expect(request.query().end).toBeCalled()
    })

    it('Does not request if no idToFetch', () => {
      props.article.biography_for_artist_id = null
      const component = getWrapper(props)
      component.instance().fetchItems([], jest.fn())

      expect(request.get).not.toBeCalled()
    })

    it('Calls the cb with data', () => {
      const cb = jest.fn()
      props.article.fair_id = '123'
      props.type = 'single'
      props.model = 'fairs'
      props.field = 'fair_id'
      request.query().end.mockImplementation(() => {
        return cb(response.body.data.fairs)
      })
      const component = getWrapper(props)
      component.instance().fetchItem('123', cb)

      expect(cb.mock.calls[0][0][0]._id).toBe('123')
      expect(cb.mock.calls[0][0][0].name).toBe('NADA New York')
    })
  })

  describe('#fetchItems', () => {
    it('Calls query with ids to fetch', () => {
      const query = jest.fn()
      props.article.fair_ids = ['123', '456']
      const component = getWrapper(props)
      component.instance().getQuery = jest.fn(() => {
        return query
      })
      component.instance().fetchItems([], jest.fn())

      expect(component.instance().getQuery.mock.calls[0][0]).toBe('fairs')
      expect(query.mock.calls[0][0].length).toBe(props.article.fair_ids.length)
      expect(query.mock.calls[0][0][0]).toBe(props.article.fair_ids[0])
    })

    it('Calls #idsToFetch', () => {
      props.article.fair_ids = ['123', '456']
      const component = getWrapper(props)
      component.instance().idsToFetch = jest.fn(() => ['456'])
      component.instance().fetchItems(['123'], jest.fn())

      expect(component.instance().idsToFetch.mock.calls[0][0][0]).toBe('123')
    })

    it('Makes a request to metaphysics', () => {
      props.article.fair_ids = ['123', '456']
      request.query().end.mockImplementation(() => {
        return response.body.data.fairs
      })
      const component = getWrapper(props)
      component.instance().fetchItems(['123'], jest.fn())

      expect(request.get.mock.calls[0][0]).toBe(props.metaphysicsURL)
      expect(request.query().end).toBeCalled()
    })

    it('Does not request if no idsToFetch', () => {
      props.article.fair_ids = []
      const component = getWrapper(props)
      component.instance().fetchItems([], jest.fn())

      expect(request.get).not.toBeCalled()
    })

    it('Calls the cb with data', () => {
      const cb = jest.fn()
      props.article.fair_ids = ['123', '456']
      request.query().end.mockImplementation(() => {
        return cb(response.body.data.fairs)
      })
      const component = getWrapper(props)
      component.instance().fetchItems(['123'], cb)

      expect(cb.mock.calls[0][0][0]._id).toBe('123')
      expect(cb.mock.calls[0][0][0].name).toBe('NADA New York')
    })
  })

  describe('#getFilter', () => {
    it('Returns correct data for non-user models', () => {
      const component = getWrapper(props)
      const items = [{
        _id: '123',
        name: 'NADA New York'
      }]
      const filter = component.instance().getFilter()
      const filteredItem = filter(items)[0]

      expect(filteredItem.id).toBe(items[0]._id)
      expect(filteredItem.name).toBe(items[0].name)
    })

    it('Returns correct data for users model', () => {
      props.model = 'users'
      const component = getWrapper(props)
      const items = [{
        id: '123',
        name: 'Molly Gottschalk',
        email: 'email@email.com'
      }]
      const filter = component.instance().getFilter()
      const filteredItem = filter(items)[0]

      expect(filteredItem.id).toBe(items[0].id)
      expect(filteredItem.name).toBe(`${items[0].name}, ${items[0].email}`)
    })
  })

  describe('#formatSelectedUser', () => {
    it('Is passed as #formatSelected prop to AutocompleteList if model is users', () => {
      props.model = 'users'
      const component = getWrapper(props)
      expect(component.find(AutocompleteList).getElement().props.formatSelected).not.toBeFalsy()
    })

    it('Does not pass #formatSelected prop to AutocompleteList if model isnt users', () => {
      const component = getWrapper(props)
      expect(component.find(AutocompleteList).getElement().props.formatSelected).toBeFalsy()
    })

    it('Returns removes email from user name', () => {
      const item = {
        id: '123',
        name: 'Molly Gottschalk, email@email.com'
      }
      const component = getWrapper(props)
      const formattedItem = component.instance().formatSelectedUser(item)

      expect(formattedItem.id).toBe(item.id)
      expect(formattedItem.name).toBe('Molly Gottschalk')
    })
  })
})
