import request from 'superagent'
import { clone, compact, dropRight, uniq } from 'lodash'
import { connect } from 'react-redux'
import { difference, flatten, pluck } from 'underscore'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { onChangeArticle } from 'client/actions/editActions'
import { AutocompleteList } from '/client/components/autocomplete2/list'
import * as Queries from 'client/queries/metaphysics'

export class AutocompleteListMetaphysics extends Component {
  static propTypes = {
    article: PropTypes.object,
    artsyURL: PropTypes.string,
    field: PropTypes.string,
    label: PropTypes.string,
    metaphysicsURL: PropTypes.string,
    model: PropTypes.string,
    onChangeArticleAction: PropTypes.func,
    placeholder: PropTypes.string,
    user: PropTypes.object
  }

  getQuery = () => {
    const { model } = this.props

    switch (model) {
      case 'artists': {
        return Queries.ArtistsQuery
      }
      case 'artworks': {
        return Queries.ArtworksQuery
      }
      case 'fairs': {
        return Queries.FairsQuery
      }
      case 'partners': {
        return Queries.PartnersQuery
      }
      case 'partner_shows': {
        return Queries.ShowsQuery
      }
      case 'sales': {
        return Queries.AuctionsQuery
      }
      case 'users': {
        return Queries.UsersQuery
      }
    }
  }

  idsToFetch = (fetchedItems) => {
    const { article, field, model } = this.props
    let alreadyFetched = uniq(pluck(fetchedItems, '_id'))
    let allIds = clone(article[field])

    if (model === 'users') {
      allIds = pluck(allIds, 'id')
      alreadyFetched = uniq(pluck(fetchedItems, 'id'))
    }
    return difference(allIds, alreadyFetched)
  }

  fetchItems = (fetchedItems, cb) => {
    const {
      metaphysicsURL,
      model,
      user
    } = this.props
    let newItems = clone(fetchedItems)
    const query = this.getQuery(model)
    const idsToFetch = this.idsToFetch(fetchedItems)

    if (idsToFetch.length) {
      request
        .get(`${metaphysicsURL}`)
        .set({
          'Accept': 'application/json',
          'X-Access-Token': (user && user.access_token)
        })
        .query({ query: query(idsToFetch) })
        .end((err, res) => {
          if (err) {
            console.error(err)
          }
          newItems.push(res.body.data[model])
          const uniqItems = uniq(flatten(newItems))
          cb(uniqItems)
        })
    } else {
      return fetchedItems
    }
  }

  getFilter = () => {
    const { model } = this.props

    const filter = (items) => {
      return items.map((item) => {
        return { id: item._id, name: item.name }
      })
    }

    const usersFilter = (items) => {
      return items.map((item) => {
        return {
          id: item.id,
          name: compact([item.name, item.email]).join(', ')
        }
      })
    }

    return model === 'users' ? usersFilter : filter
  }

  formatSelectedUser = (item) => {
    return {
      id: item.id,
      name: dropRight(item.name.split(',')).join(', ')
    }
  }

  render () {
    const {
      article,
      artsyURL,
      field,
      label,
      model,
      onChangeArticleAction,
      placeholder
    } = this.props

    return (
      <div className='field-group'>
        <label>{label || model}</label>
        <AutocompleteList
          fetchItems={(fetchedItems, cb) => this.fetchItems(fetchedItems, cb)}
          formatSelected={model === 'users' ? this.formatSelectedUser : undefined}
          items={article[field] || []}
          filter={this.getFilter()}
          onSelect={(results) => onChangeArticleAction(field, results)}
          placeholder={placeholder || `Search ${model} by name...`}
          url={`${artsyURL}/api/v1/match/${model}?term=%QUERY`}
        />
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  artsyURL: state.app.artsyURL,
  article: state.edit.article,
  metaphysicsURL: state.app.metaphysicsURL,
  user: state.app.user
})

const mapDispatchToProps = {
  onChangeArticleAction: onChangeArticle
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AutocompleteListMetaphysics)
