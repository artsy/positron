import { Box } from "@artsy/palette"
import { ArticleData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import { onChangeArticle } from "client/actions/edit/articleActions"
import { AutocompleteList } from "client/components/autocomplete2/list"
import { AutocompleteSingle } from "client/components/autocomplete2/single"
import * as Queries from "client/queries/metaphysics"
import { clone, compact, dropRight, uniq } from "lodash"
import React, { Component } from "react"
import { connect } from "react-redux"
import request from "superagent"
import { difference, flatten, pluck } from "underscore"
import { capitalize } from "underscore.string"
import { AutocompleteProps } from "./index"

export interface AutocompleteListProps extends AutocompleteProps {
  article: ArticleData
  artsyURL?: string
  field?: string
  label?: string
  model?: string
  metaphysicsURL?: string
  onChangeArticleAction?: any
  type?: any
  user?: any
}

export class AutocompleteListMetaphysics extends Component<
  AutocompleteListProps
> {
  static defaultProps = {
    type: "list",
  }

  getQuery = () => {
    const { model } = this.props

    switch (model) {
      case "artists": {
        return Queries.ArtistsQuery
      }
      case "artworks": {
        return Queries.ArtworksQuery
      }
      case "fairs": {
        return Queries.FairsQuery
      }
      case "partners": {
        return Queries.PartnersQuery
      }
      case "partner_shows": {
        return Queries.ShowsQuery
      }
      case "sales": {
        return Queries.AuctionsQuery
      }
      case "users": {
        return Queries.UsersQuery
      }
    }
  }

  idsToFetch = fetchedItems => {
    const { article, field, model } = this.props
    let alreadyFetched = uniq(pluck(fetchedItems, "_id"))
    let allIds = field && clone(article[field])

    if (model === "users") {
      allIds = pluck(allIds, "id")
      alreadyFetched = uniq(pluck(fetchedItems, "id"))
    }
    return difference(allIds, alreadyFetched)
  }

  fetchItems = (fetchedItems, cb) => {
    const { metaphysicsURL, model, user } = this.props

    const newItems = clone(fetchedItems)
    const query: any = this.getQuery()
    const idsToFetch = this.idsToFetch(fetchedItems)

    if (idsToFetch.length) {
      request
        .get(`${metaphysicsURL}`)
        .set({
          Accept: "application/json",
          "X-Access-Token": user && user.access_token,
        })
        .query({ query: query(idsToFetch) })
        .end((err, res) => {
          if (err) {
            new Error(err)
          }
          model && newItems.push(res.body.data[model])
          const uniqItems = uniq(flatten(newItems))
          cb(uniqItems)
        })
    } else {
      return fetchedItems
    }
  }

  fetchItem = (_item, cb) => {
    const { article, field, metaphysicsURL, model, user } = this.props

    const query: any = this.getQuery()

    const idToFetch = article && field && article[field]

    if (idToFetch) {
      request
        .get(`${metaphysicsURL}`)
        .set({
          Accept: "application/json",
          "X-Access-Token": user && user.access_token,
        })
        .query({ query: query(idToFetch) })
        .end((err, res) => {
          if (err) {
            new Error(err)
          }
          model && cb(res.body.data[model])
        })
    }
  }

  getFilter = () => {
    const { model } = this.props

    const filter = items => {
      return items.map(item => {
        return { id: item._id, name: item.name }
      })
    }

    const usersFilter = items => {
      return items.map(item => {
        return {
          id: item.id,
          name: compact([item.name, item.email]).join(", "),
        }
      })
    }

    return model === "users" ? usersFilter : filter
  }

  formatSelectedUser = item => {
    return {
      id: item.id,
      name: dropRight(item.name.split(",")).join(", "),
    }
  }

  renderAutocompleteType = () => {
    const {
      article,
      artsyURL,
      field,
      label,
      model,
      onChangeArticleAction,
      placeholder,
      type,
    } = this.props
    const idToFetch = article && field && article[field]

    switch (type) {
      case "single": {
        return (
          <AutocompleteSingle
            article={article}
            fetchItem={(item, cb) => {
              this.fetchItem(item, cb)
            }}
            filter={this.getFilter()}
            formatSelected={
              model === "users" ? this.formatSelectedUser : undefined
            }
            idToFetch={idToFetch || null}
            label={capitalize(label || model)}
            onSelect={result => onChangeArticleAction(field, result)}
            placeholder={placeholder || `Search ${model} by name...`}
            url={`${artsyURL}/api/v1/match/${model}?term=%QUERY`}
          />
        )
      }
      default: {
        return (
          <AutocompleteList
            fetchItems={(fetchedItems, cb) => this.fetchItems(fetchedItems, cb)}
            formatSelected={
              model === "users" ? this.formatSelectedUser : undefined
            }
            items={idToFetch || []}
            filter={this.getFilter()}
            label={capitalize(label || model)}
            onSelect={results => onChangeArticleAction(field, results)}
            placeholder={placeholder || `Search ${model} by name...`}
            url={`${artsyURL}/api/v1/match/${model}?term=%QUERY`}
          />
        )
      }
    }
  }

  render() {
    return <Box pb={40}>{this.renderAutocompleteType()}</Box>
  }
}

const mapStateToProps = state => ({
  artsyURL: state.app.artsyURL,
  article: state.edit.article,
  metaphysicsURL: state.app.metaphysicsURL,
  user: state.app.user,
})

const mapDispatchToProps = {
  onChangeArticleAction: onChangeArticle,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AutocompleteListMetaphysics)
