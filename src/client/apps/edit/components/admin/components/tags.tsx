import { Box, Flex } from "@artsy/palette"
import { Input } from "@artsy/reaction/dist/Components/Input"
import { ArticleData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import { uniq } from "lodash"
import React, { Component } from "react"
import { connect } from "react-redux"
import { clean } from "underscore.string"
import { onChangeArticle } from "../../../../../actions/edit/articleActions"
import { FormLabel } from "../../../../../components/form_label"

interface TagsProps {
  article: ArticleData
  onChangeArticleAction: (key: string, value: any) => void
}

export class AdminTags extends Component<TagsProps> {
  onChange = (key, value) => {
    const { onChangeArticleAction } = this.props

    let tagsArray = value.split(",").map(tag => clean(tag))
    tagsArray = tagsArray.filter(Boolean)
    onChangeArticleAction(key, uniq(tagsArray))
  }

  render() {
    const { article } = this.props
    const topicTags = article.tags || []
    const trackingTags = article.tracking_tags || []

    return (
      <Flex flexDirection={["column", "row"]}>
        <Box width={["100%", "50%"]} pr={[0, 20]} pb={40}>
          <FormLabel>Topic Tags</FormLabel>
          <Input
            block
            defaultValue={topicTags.join(", ")}
            onChange={e => this.onChange("tags", e.currentTarget.value)}
            placeholder="Start typing a topic tag..."
          />
        </Box>

        <Box width={["100%", "50%"]} pl={[0, 20]} pb={40}>
          <FormLabel>Tracking Tags</FormLabel>
          <Input
            block
            defaultValue={trackingTags.join(", ")}
            onChange={e =>
              this.onChange("tracking_tags", e.currentTarget.value)
            }
            placeholder="Start typing a tracking tag..."
          />
        </Box>
      </Flex>
    )
  }
}

const mapStateToProps = state => ({
  article: state.edit.article,
})

const mapDispatchToProps = {
  onChangeArticleAction: onChangeArticle,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AdminTags)
