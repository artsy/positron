import { Box, Checkbox, Flex, Sans } from "@artsy/palette"
import colors from "@artsy/reaction/dist/Assets/Colors"
import { ArticleData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import { uniq } from "lodash"
import React, { Component } from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import { ListItem } from "../../../../../..//components/autocomplete2/list"
import {
  onAddFeaturedItem,
  setMentionedItems,
} from "../../../../../../actions/edit/articleActions"
import { FormLabel } from "../../../../../../components/form_label"
import * as ArticleUtils from "../../../../../../models/article.js"
const Artists = require("../../../../../../collections/artists.coffee")
const Artworks = require("../../../../../../collections/artworks.coffee")

interface MentionedListProps {
  article: ArticleData
  mentioned: any
  model: string
  onAddFeaturedItemAction: (model: string, value: any) => void
  setMentionedItemsAction: (model: string, value: any) => void
}

export class MentionedList extends Component<MentionedListProps> {
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
    const canBeFeatured: any[] = []

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

  renderItem = item => {
    const { model, onAddFeaturedItemAction } = this.props
    const { _id, name } = item

    if (!this.isFeatured(_id)) {
      return (
        <MentionedItem
          key={_id}
          onClick={() => onAddFeaturedItemAction(model, item)}
        >
          {name}
          <Sans size="2" />
        </MentionedItem>
      )
    }
  }

  renderFeatureAll = () => {
    const { model } = this.props
    const hasMentioned = this.notFeaturedArray().length > 0

    if (hasMentioned) {
      return (
        <Box pb={1}>
          <Checkbox onSelect={() => this.featureAll()}>
            <FormLabel>Feature all mentioned {`${model}s`}</FormLabel>
          </Checkbox>
        </Box>
      )
    }
  }

  render() {
    return (
      <Flex flexDirection="column">
        {this.renderFeatureAll()}
        {this.notFeaturedArray().map(item => this.renderItem(item))}
      </Flex>
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

const MentionedItem = styled(ListItem)`
  ${Sans} {
    color: ${colors.grayDark};
    &:after {
      content: "Mentioned";
    }
  }
  &:hover {
    ${Sans} {
      &:after {
        color: ${colors.purpleRegular};
        content: "Feature";
        background: url(/icons/check_p.svg) 99% top no-repeat;
        background-size: 13px;
        padding-right: 18px;
      }
    }
  }
`
