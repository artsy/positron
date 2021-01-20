import { Box } from "@artsy/palette"
import { ArticleData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import { clone, compact, dropRight, uniq } from "lodash"
import React, { Component } from "react"
import { connect } from "react-redux"
import request from "superagent"
import { difference, flatten, pluck } from "underscore"
import { capitalize } from "underscore.string"
import { onChangeArticle } from "../../../client/actions/edit/articleActions"
import * as Queries from "../../../client/queries/metaphysics"
import { AutocompleteProps } from "./index"
import { AutocompleteList } from "./list"
import { AutocompleteSingle } from "./single"

export interface AutocompleteListProps extends AutocompleteProps {
  article: ArticleData
  artsyURL?: string
  field: string
  label?: string
  model: string
  metaphysicsURL?: string
  onChangeArticleAction?: any
  type?: any
  user?: any
  isDraggable?: boolean
  onDragEnd?: (items: any[]) => void
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
        return Queries.PartnersConnectionQuery
      }
      case "partner_shows": {
        return Queries.ShowsConnectionQuery
      }
      case "sales": {
        return Queries.SalesConnectionQuery
      }
      case "users": {
        return Queries.UsersQuery
      }
    }
  }

  getMpRootField = () => {
    const { model } = this.props

    switch (model) {
      case "partners":
      case "sales":
      case "users": {
        return `${model}Connection`
        break
      }
      case "partner_shows": {
        return "showsConnection"
        break
      }
      default: {
        return model
      }
    }
  }

  fieldIsMpConnection = () => {
    const { model } = this.props
    return this.getMpRootField().includes("Connection") || model === "artworks"
  }

  idsToFetch = fetchedItems => {
    const { article, field, model } = this.props
    let allIds = clone(article[field])

    if (model === "users") {
      allIds = pluck(allIds, "id")
    }
    const alreadyFetched = uniq(pluck(fetchedItems, "_id"))
    return difference(allIds, alreadyFetched)
  }

  fetchItems = (fetchedItems, cb) => {
    const { metaphysicsURL, user } = this.props
    const newItems = clone(fetchedItems)
    const query: any = this.getQuery()
    const idsToFetch = this.idsToFetch(fetchedItems)
    const rootField = this.getMpRootField()
    // TODO: Metaphysics only returns shows with "displayable: true"
    // and sales with "live: true", meaning shows and sales
    // will not display in UI once they have closed
    if (idsToFetch.length) {
      request
        .get(metaphysicsURL)
        .set({
          Accept: "application/json",
          "X-Access-Token": user && user.access_token,
        })
        .query({ query: query(idsToFetch) })
        .end((err, res) => {
          if (err) {
            new Error(err)
          }
          if (res.body.data) {
            if (this.fieldIsMpConnection()) {
              newItems.push(getItemsFromConnection(res.body.data[rootField]))
            } else {
              res.body.data[rootField].forEach(item => {
                newItems.push(formatMpItem(item))
              })
            }
            const uniqItems = uniq(flatten(newItems))
            cb(uniqItems)
          }
        })
    } else {
      return fetchedItems
    }
  }

  fetchItem = (_item, cb) => {
    const { article, field, metaphysicsURL, user } = this.props
    const query: any = this.getQuery()
    const idToFetch = article[field]
    const rootField = this.getMpRootField()

    if (idToFetch) {
      request
        .get(metaphysicsURL)
        .set({
          Accept: "application/json",
          "X-Access-Token": user && user.access_token,
        })
        .query({ query: query(idToFetch) })
        .end((err, res) => {
          if (err) {
            new Error(err)
          }
          if (res.body.data) {
            if (this.fieldIsMpConnection()) {
              cb(getItemsFromConnection(res.body.data[rootField]))
            } else {
              res.body.data[rootField].forEach(item => {
                cb(formatMpItem(item))
              })
            }

            cb(res.body.data[rootField])
          }
        })
    }
  }

  getSearchResultImage = item => {
    switch (this.props.model) {
      case "artworks": {
        return (
          (item.images && item.images[0] && item.images[0].image_urls.small) ||
          item.images[0].image_urls.square
        )
      }
      default: {
        return (
          item.image_urls && (item.image_urls.small || item.image_urls.square)
        )
      }
    }
  }

  getFilter = () => {
    const { model } = this.props

    const filter = items => {
      return items.map(item => {
        const thumbnail_image = this.getSearchResultImage(item)
        return {
          id: item._id,
          name: item.name,
          title: item.title,
          thumbnail_image,
        }
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
      disabled,
    } = this.props

    switch (type) {
      case "single": {
        return (
          <AutocompleteSingle
            fetchItem={(item, cb) => {
              this.fetchItem(item, cb)
            }}
            filter={this.getFilter()}
            formatSelected={
              model === "users" ? this.formatSelectedUser : undefined
            }
            idToFetch={article[field]}
            label={capitalize(label || model)}
            onSelect={result => onChangeArticleAction(field, result)}
            placeholder={placeholder || `Search ${model} by name...`}
            url={`${artsyURL}/api/v1/match/${model}?term=%QUERY`}
            article={this.props.article}
            model={this.props.model}
            field={this.props.field}
            disabled={disabled}
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
            items={article[field] || []}
            filter={this.getFilter()}
            label={capitalize(label || model)}
            onSelect={results => onChangeArticleAction(field, results)}
            placeholder={placeholder || `Search ${model} by name...`}
            url={`${artsyURL}/api/v1/match/${model}?term=%QUERY`}
            disabled={disabled}
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

interface Edge {
  node: Node
}
interface Node {
  internalID: string
  name?: string
  title?: string
}

export const getItemsFromConnection = (connection: { edges: Edge[] }) => {
  return connection.edges.map(({ node }) => formatMpItem(node))
}
const formatMpItem = (node: Node) => ({
  _id: node.internalID,
  name: node.name || node.title,
})
