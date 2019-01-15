import { Box, Button, Flex } from "@artsy/palette"
import { onChangeArticle } from "client/actions/edit/articleActions"
import { AutocompleteInlineList } from "client/components/autocomplete2/inline_list"
import { FormLabel } from "client/components/form_label"
import { filter, map } from "lodash"
import React, { Component } from "react"
import { connect } from "react-redux"
import { ArticleData } from "reaction/Components/Publishing/Typings"
import styled from "styled-components"
const Verticals = require("client/collections/verticals.coffee")

interface VerticalsTagsProps {
  article: ArticleData
  apiURL: string
  onChangeArticleAction: (key: string, value: any) => void
}

export class AdminVerticalsTags extends Component<VerticalsTagsProps> {
  state = {
    vertical: this.props.article.vertical || null,
    verticals: [],
  }

  componentWillMount = () => {
    this.fetchVerticals()
  }

  fetchVerticals = () => {
    new Verticals().fetch({
      cache: true,
      success: res => {
        const verticals = map(res.sortBy("name"), "attributes")
        this.maybeSetupNews(verticals)
        this.setState({ verticals })
      },
    })
  }

  maybeSetupNews = verticals => {
    const { article, onChangeArticleAction } = this.props

    if (article.layout === "news" && !article.vertical) {
      const vertical = filter(verticals, ["name", "News"])[0]
      onChangeArticleAction("vertical", vertical)
    }
  }

  renderVerticalsList = () => {
    const { verticals } = this.state
    const { article, onChangeArticleAction } = this.props
    const name = article.vertical && article.vertical.name

    return verticals.map((item: { name: string; _id: string }, index) => {
      const isActive = name && item.name === name

      return (
        <Button
          key={index}
          variant={isActive ? "primaryBlack" : "secondaryOutline"}
          onClick={() => {
            const vertical = isActive ? null : item
            onChangeArticleAction("vertical", vertical)
          }}
          mr={1}
          mt={1}
        >
          {item.name}
        </Button>
      )
    })
  }

  render() {
    const { apiURL, article, onChangeArticleAction } = this.props

    return (
      <Flex flexDirection={["column", "row"]}>
        <Box width={["100%", "50%"]} pr={[0, 2]} pb={4}>
          <FormLabel>Editorial Vertical</FormLabel>
          <VerticalsList mt={0.5}>{this.renderVerticalsList()}</VerticalsList>
        </Box>

        <Box width={["100%", "50%"]} pl={[0, 2]} pb={4}>
          <Box pb={4}>
            <FormLabel>Topic Tags</FormLabel>
            <AutocompleteInlineList
              items={article.tags}
              filter={tags => {
                return tags.results.map(tag => {
                  return { id: tag.id, name: tag.name }
                })
              }}
              formatSelected={tag => tag.name}
              onSelect={tags => onChangeArticleAction("tags", tags)}
              placeholder="Start typing a topic tag..."
              url={`${apiURL}/tags?public=true&q=%QUERY`}
            />
          </Box>

          <Box>
            <FormLabel>Tracking Tags</FormLabel>
            <AutocompleteInlineList
              items={article.tracking_tags}
              filter={tags => {
                return tags.results.map(tag => {
                  return { id: tag.id, name: tag.name }
                })
              }}
              formatSelected={tag => tag.name}
              onSelect={tags => onChangeArticleAction("tracking_tags", tags)}
              placeholder="Start typing a tracking tag..."
              url={`${apiURL}/tags?public=false&q=%QUERY`}
            />
          </Box>
        </Box>
      </Flex>
    )
  }
}

const mapStateToProps = state => ({
  apiURL: state.app.apiURL,
  article: state.edit.article,
})

const mapDispatchToProps = {
  onChangeArticleAction: onChangeArticle,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AdminVerticalsTags)

const VerticalsList = styled(Box)`
  button {
    outline: none;
  }
`
