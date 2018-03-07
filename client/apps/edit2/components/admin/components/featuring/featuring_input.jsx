import request from 'superagent'
import { last } from 'lodash'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { onAddFeaturedItem } from 'client/actions/editActions2.js'
import * as Queries from 'client/queries/metaphysics'

export class FeaturingInput extends Component {
  static propTypes = {
    metaphysicsURL: PropTypes.string,
    model: PropTypes.string,
    onAddFeaturedItemAction: PropTypes.func,
    user: PropTypes.object
  }

  state = {
    value: ''
  }

  getQuery = () => {
    const { model } = this.props

    if (model === 'artist') {
      return Queries.ArtistQuery
    } else {
      return Queries.ArtworkQuery
    }
  }

  fetchItem = (id) => {
    const {
      metaphysicsURL,
      model,
      onAddFeaturedItemAction,
      user
    } = this.props

    request
      .get(`${metaphysicsURL}`)
      .set({
        'Accept': 'application/json',
        'X-Access-Token': (user && user.access_token)
      })
      .query({ query: this.getQuery(id) })
      .end((err, res) => {
        if (err) {
          console.error(err)
        }
        onAddFeaturedItemAction(model, res.body.data[model])
        this.setState({loading: false, value: ''})
      })
  }

  onFeature = (value) => {
    const id = last(value.split('/'))

    this.setState({loading: true})
    this.fetchItem(id)
  }

  render () {
    const { model } = this.props
    const { value } = this.state

    return (
      <input
        className='FeaturingInput bordered-input'
        value={value}
        onChange={(e) => this.setState({value: e.target.value})}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            this.onFeature(e.target.value)
          }
        }}
        placeholder={`Add an ${model} by slug or URL...`}
      />
    )
  }
}

const mapStateToProps = (state) => ({
  metaphysicsURL: state.app.metaphysicsURL,
  user: state.app.user
})

const mapDispatchToProps = {
  onAddFeaturedItemAction: onAddFeaturedItem
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FeaturingInput)
