import colors from "@artsy/reaction/dist/Assets/Colors"
import { connect } from "react-redux"
import { uniq } from "lodash"
import React, { Component } from "react"
import PropTypes from "prop-types"
import {
  onAddFeaturedItem,
  setMentionedItems,
} from "client/actions/edit/articleActions"
import * as ArticleUtils from "client/models/article.js"
import Artists from "client/collections/artists.coffee"
import Artworks from "client/collections/artworks.coffee"
import { ListItem } from "client/components/autocomplete2/list"

export class MentionedList extends Component {
  static propTypes = {
    article: PropTypes.object,
    mentioned: PropTypes.object,
    model: PropTypes.string,
    onAddFeaturedItemAction: PropTypes.func,
    setMentionedItemsAction: PropTypes.func,
  }

  componentWillMount = () => {
    const { model } = this.props

    if (model === "artist") {
      this.getMentionedArtists()
    } else {
      this.getMentionedArtworks()
    }
  }

  getMentionedArtists = () => {
    const { article, setMentionedItemsAction } = this.props
    const artists = new Artists()
    const ids = ArticleUtils.getMentionedArtistSlugs(article)

    artists.getOrFetchIds(ids, {
      success: () => {
        const denormalizedArtists = artists.models.map(item => {
          return { _id: item.get("_id"), name: item.get("name") }
        })
        setMentionedItemsAction("artist", denormalizedArtists)
      },
    })
  }

  getMentionedArtworks = () => {
    const { article, setMentionedItemsAction } = this.props
    const artworks = new Artworks()
    const ids = ArticleUtils.getMentionedArtworkSlugs(article)

    artworks.getOrFetchIds(ids, {
      success: () => {
        const denormalizedArtworks = artworks.models.map(item => {
          return { _id: item.get("_id"), name: item.get("title") }
        })
        setMentionedItemsAction("artwork", denormalizedArtworks)
      },
    })
  }

  notFeaturedArray = () => {
    const { mentioned, model } = this.props
    let canBeFeatured = []

    mentioned[model].map(item => {
      if (!this.isFeatured(item._id)) {
        canBeFeatured.push(item)
      }
    })
    return uniq(canBeFeatured)
  }

  isFeatured = id => {
    const { article, model } = this.props
    let ids

    if (model === "artist") {
      ids = article.primary_featured_artist_ids || []
    } else {
      ids = article.featured_artwork_ids || []
    }

    return ids.includes(id)
  }

  featureAll = () => {
    const { model, onAddFeaturedItemAction } = this.props

    this.notFeaturedArray().map(item => {
      onAddFeaturedItemAction(model, item)
    })
  }

  renderItem = (item, index) => {
    const { model, onAddFeaturedItemAction } = this.props
    const { _id, name } = item

    if (!this.isFeatured(_id)) {
      return (
        <ListItem
          className="MentionedList__item"
          color={colors.grayDark}
          key={_id}
          onClick={() => onAddFeaturedItemAction(model, item)}
        >
          {name}
          <span className="mention" />
        </ListItem>
      )
    }
  }

  renderFeatureAll = () => {
    const { model } = this.props
    const hasMentioned = this.notFeaturedArray().length > 0

    if (hasMentioned) {
      return (
        <div
          className="field-group field-group--inline flat-checkbox"
          onClick={() => this.featureAll()}
        >
          <input type="checkbox" readOnly />
          <label>Feature all mentioned {`${model}s`}</label>
        </div>
      )
    }
  }

  render() {
    return (
      <div className="MentionedList">
        {this.renderFeatureAll()}
        {this.notFeaturedArray().map((item, index) =>
          this.renderItem(item, index)
        )}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  article: state.edit.article,
  mentioned: state.edit.mentioned,
  user: state.app.user,
})

const mapDispatchToProps = {
  onAddFeaturedItemAction: onAddFeaturedItem,
  setMentionedItemsAction: setMentionedItems,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MentionedList)
