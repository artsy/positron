import request from 'superagent'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { onFetchFeatured, onRemoveFeature } from 'client/actions/editActions2.js'
import { ListItem } from 'client/components/autocomplete2/list'
import * as Queries from 'client/queries/metaphysics'

export class FeaturingList extends Component {
  static propTypes = {
    article: PropTypes.object,
    featured: PropTypes.object,
    metaphysicsURL: PropTypes.string,
    model: PropTypes.string,
    onFetchFeaturedAction: PropTypes.func,
    onRemoveFeatureAction: PropTypes.func,
    user: PropTypes.object
  }

  componentWillMount = () => {
    this.fetchFeatured()
  }

  getQuery = (ids) => {
    const { model } = this.props

    if (model === 'artist') {
      return Queries.ArtistsQuery(ids)
    } else {
      return Queries.ArtworksQuery(ids)
    }
  }

  fetchFeatured = () => {
    const {
      article,
      model,
      metaphysicsURL,
      onFetchFeaturedAction,
      user
    } = this.props
    let key

    if (model === 'artist') {
      key = 'primary_featured_artist_ids'
    } else {
      key = 'featured_artwork_ids'
    }
    const ids = article[key] || []
    const query = this.getQuery(ids)

    if (ids && ids.length) {
      request
        .get(`${metaphysicsURL}`)
        .set({
          'Accept': 'application/json',
          'X-Access-Token': (user && user.access_token)
        })
        .query({ query })
        .end((err, res) => {
          if (err) {
            console.error(err)
          }
          const items = res.body.data[`${model}s`]
          onFetchFeaturedAction(model, items)
          this.setState({loading: false, value: ''})
        })
    }
  }

  renderItem = (item, index) => {
    const { model, onRemoveFeatureAction } = this.props
    const { _id, name, title } = item
    const text = model === 'artist' ? name : title

    return (
      <ListItem
        className='FeaturingList__item'
        key={_id}
      >
        <span className='selected'>
          {text}
        </span>
        <button
          className='remove-button'
          onClick={() => onRemoveFeatureAction(model, item, index)}
        />
      </ListItem>
    )
  }

  render () {
    const { featured, model } = this.props

    return (
      <div className='FeaturingList'>
        {featured[model].map((item, index) => this.renderItem(item, index))}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  article: state.edit.article,
  featured: state.edit.featured,
  metaphysicsURL: state.app.metaphysicsURL,
  user: state.app.user
})

const mapDispatchToProps = {
  onFetchFeaturedAction: onFetchFeatured,
  onRemoveFeatureAction: onRemoveFeature
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FeaturingList)
